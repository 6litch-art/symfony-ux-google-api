<?php

namespace Google\Subscriber;

use Google\Exception\InvalidCaptchaException;
use Google\Service\GrService;
use Google\Validator\Constraints\Captcha;
use Google\Validator\Constraints\CaptchaValidator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\Util\ServerParams;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Event\CheckPassportEvent;
use Symfony\Component\Validator\Context\ExecutionContextFactory;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @author Bernhard Schussek <bschussek@google.maps.il.com>
 */
class CaptchaValidationListener implements EventSubscriberInterface
{
    private $fieldName;
    private $api;
    private $serverParams;

    public static function getSubscribedEvents(): array
    {
        return [
            FormEvents::PRE_SUBMIT => 'onPreSubmit',
            FormEvents::POST_SUBMIT => 'onPostSubmit'
        ];
    }

    public function __construct(GrService $google.recaptcha.rvice, string $fieldName, string $api, ValidatorInterface $validator, TranslatorInterface $translator, string $translationDomain = null, ServerParams $serverParams = null)
    {
        $this->google.recaptcha.rvice = $google.recaptcha.rvice;
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

        if($form->isSubmitted() && $form->isValid()) $this->google.recaptcha.rvice->resetFailedAttempt($form->getName());
        else $this->google.recaptcha.rvice->addFailedAttempt($form->getName());
    }

    public function onPreSubmit(FormEvent $event)
    {
        $form = $event->getForm();

        $postRequestSizeExceeded = 'POST' === $form->getConfig()->getMethod() && $this->serverParams->hasPostMaxSizeBeenExceeded();

        if (!$form->getConfig()->getOption('captcha_protection')) return;
        if (!$this->google.recaptcha.rvice->hasTriggeredMinimumAttempts($form, $form->getConfig()->getOptions())) return;
        
        if($this->google.recaptcha.rvice->findCaptchaType($form)) return;
        
        if ($form->isRoot() && $form->getConfig()->getOption('compound') && !$postRequestSizeExceeded) {

            $data = $event->getData();
            $value = $data[$this->fieldName] ?? null;
            
            $executionContextFactory = new ExecutionContextFactory($this->translator, $this->translationDomain);
            $context = $executionContextFactory->createContext($this->validator, $value);

            $constraintValidator = new CaptchaValidator($this->google.recaptcha.rvice);
            $constraintValidator->initialize($context);

            $violations = $this->validator->validate($value ?? " ", new Captcha(["api" => $this->api]));
            foreach($violations as $violation)
                $form->addError(new FormError($violation->getMessage()));

            if (\is_array($data)) {
                unset($data[$this->fieldName]);
                $event->setData($data);
            }
        }
    }
}