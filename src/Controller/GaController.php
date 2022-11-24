<?php

namespace Google\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Kernel;

use Google_Service_AnalyticsReporting_DateRange;
use Google_Service_AnalyticsReporting_Metric;
use Google_Service_AnalyticsReporting_ReportRequest;
use Google_Service_AnalyticsReporting_GetReportsRequest;

use Google\Service\GaService;

class GaController extends AbstractController
{
    private $gaService;
    public function __construct(GaService $gaService) {
        $this->gaService = $gaService;
    }

    /**
     * Controller example
     * @Route("/", name="app_google_analytics")
     */
    public function Main(): Response
    {
        return $this->json($this->gaService->getBasics(), 200);
    }
}
