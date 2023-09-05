<?php

namespace Google\Form\Extension;

use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use EasyCorp\Bundle\EasyAdminBundle\Provider\AdminContextProvider;
use Google\Service\GrService;
use Google\Subscriber\CaptchaValidationListener;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 */
class FormTypeCaptchaExtension extends AbstractTypeExtension
{
    protected bool $defaultEnabled;

    protected GrService $grService;

    protected ValidatorInterface $validator;

    protected TranslatorInterface $translator;

    /**
     * @var ?AdminContext
     */
    protected ?AdminContext $easyadminContext;

    public function __construct(GrService $grService, ValidatorInterface $validator, TranslatorInterface $translator, AdminContextProvider $adminContextProvider)
    {
        $this->grService = $grService;
        $this->translator = $translator;
        $this->validator = $validator;
        $this->easyadminContext = $adminContextProvider->getContext();
    }

    /**
     * {@inheritdoc}
     */
    public static function getExtendedTypes(): iterable
    {
        return [FormType::class];
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'captcha_protection' => $this->grService->isEnabled() && (null === $this->easyadminContext),
            'captcha_api' => GrService::APIV2,
            'captcha_type' => 'checkbox',
            'captcha_field_name' => '_captcha',
            'captcha_reset_on_success' => true,
            'captcha_min_attempts' => 5,
            'captcha_score_threshold' => 0.5,
        ]);
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        if (!$options['captcha_protection']) {
            return;
        }
        
        if (!$builder->getForm()->isRoot()) {
            return;
        }

        $builder->addEventSubscriber(new CaptchaValidationListener(
            $this->grService,
            $options['captcha_field_name'],
            $options['captcha_api'],
            $this->validator,
            $this->translator,
            $options['translation_domain'] ?? ''
        ));
    }

    /**
     * @param array $input Input array to add items to
     * @param array $items Items to insert (as an array)
     * @param int $position Position to inject items from (starts from 0)
     */
    public function arrayInject(array $input, array $items, int $position): array
    {
        if (0 >= $position) {
            return array_merge($items, $input);
        }
        if ($position >= count($input)) {
            return array_merge($input, $items);
        }

        return array_merge(
            array_slice($input, 0, $position, true),
            $items,
            array_slice($input, $position, null, true)
        );
    }

    public function finishView(FormView $view, FormInterface $form, array $options): void
    {
        if (!$options['captcha_protection']) {
            return;
        }
        if (!$view->parent && $options['compound']) {
            if (GrService::APIV2 == $options['captcha_api'] && !$this->grService->hasTriggeredMinimumAttempts($form, $options)) {
                return;
            }
            if ($this->grService->findCaptchaType($form)) {
                return;
            }

            $factory = $form->getConfig()->getFormFactory();
            $captchaForm = $factory->createNamed($options['captcha_field_name'], $this->grService->getType($options['captcha_api']), null, [
                'mapped' => false,
            ]);

            if ($submitButton = $this->grService->findSubmitButton($form)) {
                $keys = array_keys($view->children);
                $submitIndex = array_search($submitButton->getName(), $keys);

                $view->children = $this->arrayInject($view->children, [$options['captcha_field_name'] => $captchaForm->createView($view)], $submitIndex);
            } else {
                $view->children[$options['captcha_field_name']] = $captchaForm->createView($view);
            }
        }
    }
}
