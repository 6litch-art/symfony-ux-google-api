<?php

namespace Google\Form;

use Base\Validator\Constraints\NotBlank;
use Google\Form\Type\ReCaptchaV2Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class GrFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
        ->add('title', TextType::class, [
            'constraints' => [new NotBlank(['message' => 'Blank title.']) ]
        ]);

        $builder->add('captcha', ReCaptchaV2Type::class, ["type" => "checkbox"]);
        // $builder->add('captcha', ReCaptchaV2Type::class, ["type" => "invisible"]);
        // $builder->add('captcha', ReCaptchaV3Type::class);
        $builder->add('valid', SubmitType::class);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('attr', [
            'novalidate' => true
        ]);
    }
}