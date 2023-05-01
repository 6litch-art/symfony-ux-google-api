<?php

namespace Google\Controller;

use Google\Service\GaService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 *
 */
class GaController extends AbstractController
{
    private GaService $gaService;

    public function __construct(GaService $gaService)
    {
        $this->gaService = $gaService;
    }

    /**
     * Controller example.
     *
     * @Route("/analytics", name="analytics", priority=2)
     */
    public function Main(): Response
    {
        return $this->json($this->gaService->getBasics());
    }
}
