<?php

namespace Google\Model\Maps;

use Google\Builder\GmClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class Elevation extends GmClient
{
    /**
     * @param HttpClientInterface $client
     * @param $opts
     */
    public function __construct(HttpClientInterface $client, $opts = [])
    {
        parent::__construct($client, $opts);
        $this->setUrl('https://maps.googleapis.com/maps/api/elevation');
        $this->setOutputFormat(self::JsonEncoding);
    }
}
