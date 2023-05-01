<?php

namespace Google\Form\Type;

use Google\Service\GrService;
use Google\Validator\Constraints\Captcha;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\SubmitButton;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ReCaptchaType.
 */
class ReCaptchaV3Type extends AbstractType
{
    protected GrService $grService;

    public function __construct(GrService $grService)
    {
        $this->grService = $grService;
    }

    /**
     * @inheritDoc
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver
            ->setDefault('constraints', new Captcha(["api" => GrService::APIV3]))
            ->setDefault('sitekey', null);
    }

    public function getParent(): string
    {
        return HiddenType::class;
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix(): string
    {
        return 'recaptchaV3';
    }

    /**
     * @inheritDoc
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars["enable"] = $this->grService->isEnabled();
        if (!$this->grService->isEnabled()) {
            return;
        }

        $view->vars["api"] = GrService::APIV3;
        $view->vars["type"] = "invisible";
        $view->vars["sitekey"] = $options['sitekey'] ?? $this->grService->getSiteKey(GrService::APIV3);
        $this->grService->initJs();
    }
}
