<?php

namespace Google\Subscriber;

use Google\Badge\CaptchaBadge;
use Google\Exception\InvalidCaptchaException;
use Google\Service\GrService;
use Google\Validator\Constraints\Captcha;
use Google\Validator\Constraints\CaptchaValidator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Http\Event\CheckPassportEvent;
use Symfony\Component\Security\Http\Event\LoginFailureEvent;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use Symfony\Component\Validator\Context\ExecutionContextFactory;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 */
class CaptchaSubscriber implements EventSubscriberInterface
{
    protected GrService $grService;

    protected ValidatorInterface $validator;

    protected TranslatorInterface $translator;

    /**
     * @var string|null
     */
    protected ?string $translationDomain;

    public function __construct(GrService $grService, ValidatorInterface $validator, TranslatorInterface $translator, ?string $translationDomain = null)
    {
        $this->validator = $validator;
        $this->grService = $grService;
        $this->translator = $translator;
        $this->translationDomain = $translationDomain;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => ['onKernelException', -1024],
            CheckPassportEvent::class => ['checkPassport', 512],

            LoginSuccessEvent::class => ['onLoginSuccess'],
            LoginFailureEvent::class => ['onLoginFailure'],
        ];
    }

    public function onLoginFailure(LoginFailureEvent $event)
    {
        $this->grService->addFailedAttempt('login');
    }

    public function onLoginSuccess(LoginSuccessEvent $event)
    {
        $this->grService->resetFailedAttempt('login');
    }

    public function onKernelException(ResponseEvent $event)
    {
        $exception = $event->getThrowable()->getClass() ?? '';
        $this->grService->addFailedAttempt('exception[' . $exception . ']');
    }

    public function checkPassport(CheckPassportEvent $event): void
    {
        $passport = $event->getPassport();
        if (!$passport->hasBadge(CaptchaBadge::class)) {
            return;
        }

        /** @var CaptchaBadge $badge */
        $badge = $passport->getBadge(CaptchaBadge::class);
        if ($badge->isResolved()) {
            return;
        }

        $value = explode(' ', \is_string($badge->getValue() ?? null) ? $badge->getValue() : '');
        $api = $value[1] ?? GrService::APIV2;
        $value = $value[0] ?? '';

        $executionContextFactory = new ExecutionContextFactory($this->translator, $this->translationDomain);
        $context = $executionContextFactory->createContext($this->validator, $value);

        $constraintValidator = new CaptchaValidator($this->grService);
        $constraintValidator->initialize($context);

        $violations = $this->validator->validate($value, new Captcha(['api' => $api]));
        if ($violations->count() > 0) {
            throw new InvalidCaptchaException($violations[0]->getMessage());
        }

        $badge->markResolved();
    }
}
