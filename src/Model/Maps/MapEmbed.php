<?php

namespace Google\Model\Maps;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class MapEmbed extends GmClient
{
    /**
     * @param $opts
     * @param HttpClientInterface|null $client
     */
    public function __construct($opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setBaseUrl('https://www.google.com/maps/embed/v1/place');
    }
}
