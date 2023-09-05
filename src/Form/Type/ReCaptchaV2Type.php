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
class ReCaptchaV2Type extends AbstractType
{
    private GrService $grService;

    public function __construct(GrService $grService)
    {
        $this->grService = $grService;
    }

    /**
     * {@inheritDoc}
     */
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver
            ->setDefault('sitekey', null)
            ->setDefault('type', 'checkbox')
            ->setDefault('constraints', new Captcha(['api' => GrService::APIV2]))
            ->setAllowedValues('type', ['checkbox', 'invisible']);
    }

    public function getParent(): string
    {
        return HiddenType::class;
    }

    public function getBlockPrefix(): string
    {
        return 'recaptchaV2';
    }

    /**
     * {@inheritDoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['enable'] = $this->grService->isEnabled();
        if (!$this->grService->isEnabled()) {
            return;
        }

        $view->vars['api'] = GrService::APIV2;
        $view->vars['type'] = $options['type'];
        $view->vars['sitekey'] = $options['sitekey'] ?? $this->grService->getSiteKey(GrService::APIV2);

        $this->grService->initJs();
    }
}
