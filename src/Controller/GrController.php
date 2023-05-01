<?php

namespace Google\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 *
 */
class GrController extends AbstractController
{
    /**
     * Controller example.
     *
     * @Route("/recaptcha/v2", name="google_recaptcha_v2", priority=2)
     */
    public function RecaptchaV2(Request $request): Response
    {
        $form = $this->createForm(GrFormTypeV2::class);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                $this->addFlash('success', 'The form is valid.');
            } else {
                $this->addFlash('error', 'The form is invalid.');
            }
        }

        return $this->render('@Gr/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * Controller example.
     *
     * @Route("/recaptcha/v3", name="google_recaptcha_v3", priority=2)
     */
    public function RecaptchaV3(Request $request): Response
    {
        $form = $this->createForm(GrFormTypeV3::class);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                $this->addFlash('success', 'The form is valid.');
            } else {
                $this->addFlash('error', 'The form is invalid.');
            }
        }

        return $this->render('@Gr/index.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
