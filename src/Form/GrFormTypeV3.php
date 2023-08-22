<?php

namespace Google\Form;

use Base\Validator\Constraints\NotBlank;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 *
 */
class GrFormTypeV3 extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'constraints' => [new NotBlank(['message' => 'Blank title.'])],
            ]);

        dump($options);
        $builder->add('captcha', ReCaptchaV3Type::class, ['type' => 'invisible']);
        $builder->add('valid', SubmitType::class);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefault('attr', [
            'novalidate' => true,
        ]);
    }
}
