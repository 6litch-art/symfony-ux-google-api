<?php

namespace Google\Model\Maps;

use Google\Builder\GmClient;
use Google\Builder\RenderingInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@gmail.com>
 */
class StreetView extends GmClient
{
    /**
     * @param HttpClientInterface $client
     * @param $options
     */
    public function __construct(HttpClientInterface $client, $options = [])
    {
        parent::__construct($client, $options);
        $this->setBaseUrl('https://maps.googleapis.com/maps/api/streetview');
        $this->setOutputFormat(self::JsonEncoding);
    }
}
