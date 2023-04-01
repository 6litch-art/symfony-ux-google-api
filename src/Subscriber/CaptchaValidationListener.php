<?php

namespace Google\Subscriber;

use Google\Service\GrService;
use Google\Validator\Constraints\Captcha;
use Google\Validator\Constraints\CaptchaValidator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\Util\ServerParams;
use Symfony\Component\Validator\Context\ExecutionContextFactory;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class CaptchaValidationListener implements EventSubscriberInterface
{
    /**
     * @var GrService
     */
    protected $grService;

    /** @var string */
    private $fieldName;

    /** @var string */
    private $api;

    /**
     * @var TranslatorInterface
     */
    protected $translator;

    /**
     * @var string
     */
    protected string $translationDomain;

    /**
     * @var ValidatorInterface
     */
    protected $validator;

    /** @var ServerParams */
    private $serverParams;

    public static function getSubscribedEvents(): array
    {
        return [
            FormEvents::PRE_SUBMIT => 'onPreSubmit',
            FormEvents::POST_SUBMIT => 'onPostSubmit'
        ];
    }

    public function __construct(GrService $grService, string $fieldName, string $api, ValidatorInterface $validator, TranslatorInterface $translator, string $translationDomain = null, ServerParams $serverParams = null)
    {
        $this->grService = $grService;
        $this->fieldName = $fieldName;
        $this->api = $api;
        $this->translator = $translator;
        $this->translationDomain = $translationDomain;
        $this->validator = $validator;
        $this->serverParams = $serverParams ?? new ServerParams();
    }

    public function onPostSubmit(FormEvent $event)
    {
        $form = $event->getForm();

        if ($form->isSubmitted() && $form->isValid() && $form->getConfig()->getOption("captcha_reset_on_success")) {
            $this->grService->resetFailedAttempt($form->getName());
        } else {
            $this->grService->addFailedAttempt($form->getName());
        }
    }

    public function onPreSubmit(FormEvent $event)
    {
        $form = $event->getForm();

        $postRequestSizeExceeded = 'POST' === $form->getConfig()->getMethod() && $this->serverParams->hasPostMaxSizeBeenExceeded();

        if (!$form->getConfig()->getOption('captcha_protection')) {
            return;
        }

        if (!$this->grService->hasTriggeredMinimumAttempts($form, $form->getConfig()->getOptions())) {
            return;
        }

        if ($this->grService->findCaptchaType($form)) {
            return;
        }

        if ($form->isRoot() && $form->getConfig()->getOption('compound') && !$postRequestSizeExceeded) {
            $data = $event->getData();
            $value = $data[$this->fieldName] ?? null;

            $executionContextFactory = new ExecutionContextFactory($this->translator, $this->translationDomain);
            $context = $executionContextFactory->createContext($this->validator, $value);

            $constraintValidator = new CaptchaValidator($this->grService);
            $constraintValidator->initialize($context);

            $violations = $this->validator->validate($value ?? " ", new Captcha(["api" => $this->api]));
            foreach ($violations as $violation) {
                $form->addError(new FormError($violation->getMessage()));
            }

            if (\is_array($data)) {
                unset($data[$this->fieldName]);
                $event->setData($data);
            }
        }
    }
}
