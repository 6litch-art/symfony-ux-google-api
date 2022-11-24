<?php

namespace Google\Controller;

use Google\Form\GrFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;

use Symfony\Component\HttpFoundation\Request;

class GrController extends AbstractController
{
    /**
     * Controller example
     * @Route("/", name="gr")
     */
    public function Main(Request $request): Response
    {
        $form = $this->createForm(GrFormType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {

            if($form->isValid()) $this->addFlash('success', 'The form is valid.');
            else $this->addFlash('error', 'The form is invalid.');
        }

        return $this->render('@Gr/index.html.twig', [
            'form' => $form->createView()
        ]);
    }
}
