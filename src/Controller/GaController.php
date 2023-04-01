<?php

namespace Google\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;

use Google\Service\GaService;

class GaController extends AbstractController
{
    private $gaService;
    public function __construct(GaService $gaService)
    {
        $this->gaService = $gaService;
    }

    /**
     * Controller example
     * @Route("/analytics", name="analytics", priority=2)
     */
    public function Main(): Response
    {
        return $this->json($this->gaService->getBasics(), 200);
    }
}
