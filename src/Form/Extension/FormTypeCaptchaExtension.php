<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Google\Form\Extension;

use EasyCorp\Bundle\EasyAdminBundle\Provider\AdminContextProvider;
use Google\Service\GrService;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Google\Subscriber\CaptchaValidationListener;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class FormTypeCaptchaExtension extends AbstractTypeExtension
{
    private $defaultEnabled;

    public function __construct(GrService $google.recaptcha.rvice, ValidatorInterface $validator, TranslatorInterface $translator, AdminContextProvider $adminContextProvider, bool $defaultEnabled = true)
    {
        $this->google.recaptcha.rvice        = $google.recaptcha.rvice;
        $this->translator       = $translator;
        $this->validator        = $validator;
        $this->easyadminContext = $adminContextProvider->getContext();

        $this->defaultEnabled   = $defaultEnabled;
    }

    /**
     * {@inheritdoc}
     */
    public static function getExtendedTypes(): iterable
    {
        return [FormType::class];
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'captcha_protection' => $this->defaultEnabled && ($this->easyadminContext === null),
            'captcha_api' => GrService::APIV2,
            'captcha_type' => "checkbox",
            'captcha_field_name' => "_captcha"
        ]);
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if (!$options["captcha_protection"]) return;
        if (!$builder->getForm()->isRoot()) return;

        $builder->addEventSubscriber(new CaptchaValidationListener(
            $this->google.recaptcha.rvice,
            $options['captcha_field_name'],
            $options['captcha_api'],
            $this->validator,
            $this->translator,
            $options['translation_domain'] ?? ""
        ));
    }


     /**
     * @param array $input    Input array to add items to
     * @param array $items    Items to insert (as an array)
     * @param int   $position Position to inject items from (starts from 0)
     *
     * @return array
     */
    function arrayInject( array $input, array $items, int $position ): array
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

    public function finishView(FormView $view, FormInterface $form, array $options)
    {
        if (!$options['captcha_protection']) return;
        if (!$view->parent && $options['compound']) {

            if(!$this->google.recaptcha.rvice->hasTriggeredMinimumAttempts($form, $options)) return;
            if($this->google.recaptcha.rvice->findCaptchaType($form)) return;

            $factory = $form->getConfig()->getFormFactory();
            $captchaForm = $factory->createNamed($options['captcha_field_name'], $this->google.recaptcha.rvice->getType($options["captcha_api"]), null, [
                'mapped' => false,
            ]);

            if( ($submitButton = $this->google.recaptcha.rvice->findSubmitButton($form)) ) {

                $keys = array_keys($view->children);
                $submitIndex = array_search($submitButton->getName(), $keys);

                $view->children = $this->arrayInject($view->children, [$options['captcha_field_name'] => $captchaForm->createView($view)], $submitIndex);

            } else {

                $view->children[$options['captcha_field_name']] = $captchaForm->createView($view);
            }
        }
    }
}
