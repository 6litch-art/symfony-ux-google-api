<?php

namespace Google\Model\Maps;

use Google\Builder\GmClient;
use Google\Builder\RenderingInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class StreetView extends GmClient implements RenderingInterface
{
    public function __construct(HttpClientInterface $client, $opts = [])
    {
        parent::__construct($client, $opts);
        $this->setBaseUrl('https://maps.googleapis.com/maps/api/streetview');
        $this->setOutputFormat(self::JsonEncoding);
    }
}
