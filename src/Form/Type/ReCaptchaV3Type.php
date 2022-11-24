<?php

namespace Google\Form\Type;

use Google\Service\GrService;
use Google\Validator\Constraints\Captcha;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ReCaptchaType.
 */
class ReCaptchaV3Type extends AbstractType
{
    public function __construct(GrService $google.recaptcha.rvice)
    {
        $this->google.recaptcha.rvice = $google.recaptcha.rvice;
    }

    /**
     * @inheritDoc
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver
            ->setDefault('constraints', new Captcha(["api" => GrService::APIV3]))
            ->setDefault('sitekey', null)
            ->setDefault('score_threshold', 0.5);
    }

    public function getParent(): string
    {
        return HiddenType::class;
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix() : string
    {
        return 'recaptchaV3';
    }

    /**
     * @inheritDoc
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars["enable"] = $this->google.recaptcha.rvice->isEnabled();
        if(!$this->google.recaptcha.rvice->isEnabled()) return;

        $view->vars["api"] = GrService::APIV3;
        $view->vars["type"] = "invisible";
        $view->vars["sitekey"] = $options['sitekey'] ?? $this->google.recaptcha.rvice->getSiteKey(GrService::APIV3);

        $this->google.recaptcha.rvice->initJs();
    }
}
