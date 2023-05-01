<?php

namespace Google\Service;

use Exception;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

use Google_Client;
use Google_Service_AnalyticsReporting;
use Google_Service_AnalyticsReporting_DateRange;
use Google_Service_AnalyticsReporting_Dimension;
use Google_Service_AnalyticsReporting_GetReportsRequest;
use Google_Service_AnalyticsReporting_Metric;
use Google_Service_AnalyticsReporting_ReportRequest;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class GaService
{
    /**
     * @var Google_Client
     */
    private Google_Client $client;
    /**
     * @var Google_Service_AnalyticsReporting
     */
    private Google_Service_AnalyticsReporting $analytics;

    /**
     * @var ?string
     */
    private ?string $viewId;

    /**
     * @var string
     */
    private ?string $jsonLocation;

    private ?CacheInterface $cache;

    /**
     * @var boolean
     */
    private bool $enable;

    /**
     * construct
     */
    public function __construct(ParameterBagInterface $parameterBag, CacheInterface $cache)
    {
        $this->enable = $parameterBag->get("ga.enable") ?? false;
        $this->viewId = $parameterBag->get("ga.view_id");
        $this->jsonLocation = $parameterBag->get("ga.json");

        $this->cache = $cache;

        if ($this->enable) {
            $this->client = new Google_Client();
            $this->client->setApplicationName("GoogleAnalytics");
            $this->client->setScopes(['https://www.googleapis.com/auth/analytics.readonly']);
            $this->client->setAuthConfig($this->jsonLocation);

            $this->analytics = new Google_Service_AnalyticsReporting($this->client);
        }
    }

    /**
     * @return Google_Service_AnalyticsReporting
     */
    public function getAnalytics()
    {
        return $this->analytics;
    }

    /**
     * @return Google_Client
     */
    public function getClient()
    {
        return $this->client;
    }

    public function setViewId($viewId)
    {
        $this->viewId = $viewId;
    }

    public function getViewId()
    {
        return $this->viewId;
    }

    public function setJsonLocation($jsonLocation)
    {
        $this->jsonLocation = $jsonLocation;
    }

    public function getJsonLocation()
    {
        return $this->jsonLocation;
    }

    public function isEnabled()
    {
        return $this->enable;
    }

    /**
     * @param $dateStart
     * @param $dateEnd
     * @return mixed
     *
     * https://ga-dev-tools.appspot.com/query-explorer/
     */
    private const EnableCache = true;
    private const GoogleStartTime = "2005-01-01";

    private function getDataDateRange($metric, $expiration = 0, $dateStart = self::GoogleStartTime, $dateEnd = "today")
    {
        if (!$this->isEnabled()) {
            return -1;
        }

        return $this->cache->get($metric . "." . $dateStart . "." . $dateEnd, function (ItemInterface $item) use ($metric, $expiration, $dateStart, $dateEnd) {
            $item->expiresAfter(self::EnableCache ? $expiration : 0);

            // Create the DateRange object
            $dateRange = new Google_Service_AnalyticsReporting_DateRange();
            $dateRange->setStartDate($dateStart);
            $dateRange->setEndDate($dateEnd);

            // Create the Metrics object
            $sessions = new Google_Service_AnalyticsReporting_Metric();
            $sessions->setExpression("ga:$metric");
            $sessions->setAlias("$metric");

            if (isset($dimensions) && is_array($dimensions)) {
                $this->reportingDimensions = [];

                foreach ($dimensions as $dimension) {
                    // Create the segoogle.maps.nt dimension.
                    $reportingDimensions = new Google_Service_AnalyticsReporting_Dimension();
                    $reportingDimensions->setName("ga:$dimension");

                    $this->reportingDimensions[] = $reportingDimensions;
                }
            }

            // Create the ReportRequest object
            $request = new Google_Service_AnalyticsReporting_ReportRequest();
            $request->setViewId($this->viewId);
            $request->setDateRanges($dateRange);

            // add dimensions
            if (isset($this->reportingDimensions) && is_array($this->reportingDimensions)) {
                $request->setDimensions($this->reportingDimensions);
            }

            $request->setMetrics([$sessions]);

            $body = new Google_Service_AnalyticsReporting_GetReportsRequest();
            $body->setReportRequests([$request]);

            try {
                $report = $this->analytics->reports->batchGet($body);
            } catch (Exception $e) {
                $report = null;
            }

            $result = $report ? $report->getReports()[0]->getData()->getTotals()[0]->getValues()[0] : null;
            return (string)$result;
        });
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getSessionsDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('sessions', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getBounceRateDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('bounceRate', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getAvgTimeOnPageDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('avgTimeOnPage', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getPageviewsPerSessionDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('pageviewsPerSession', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getPercentNewUsersDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('percentNewUsers', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getNewUsersDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('newUsers', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getUsersDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('users', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getUniquePageViewsDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('uniquePageviews', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getPageViewsDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('pageviews', $expiration, $dateStart, $dateEnd);
    }

    /**
     * @param string $dateStart
     * @param string $dateEnd
     * @return mixed
     */
    public function getBouncesDateRange($expiration = 0, string $dateStart = self::GoogleStartTime, string $dateEnd = "today")
    {
        return $this->getDataDateRange('bounces', $expiration, $dateStart, $dateEnd);
    }

    public function getBasics()
    {
        if (!$this->isEnabled()) {
            return [];
        }

        return [
            'sessions' => $this->getSessionsDateRange(3600, '30daysAgo'),
            'bounces' => $this->getBouncesDateRange(3600),
            'bounces_1day' => $this->getBouncesDateRange(3600, '1daysAgo'),
            'users' => $this->getNewUsersDateRange(3600),
            'users_1day' => $this->getUsersDateRange(3600, "1daysAgo"),
            'views' => $this->getPageViewsDateRange(3600),
            'views_1day' => $this->getPageViewsDateRange(3600, '1daysAgo')
        ];
    }

    public function getAdvanced()
    {
        if (!$this->isEnabled()) {
            return [];
        }

        // @TODO
        return [];
    }
}
