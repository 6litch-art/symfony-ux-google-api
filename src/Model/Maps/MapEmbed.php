<?php

namespace Google\Model\Maps;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;
use Google\Builder\RenderingInterface;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Config\Definition\Exception\Exception;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 *
 */
class MapEmbed extends GmClient
{
    public function __construct($opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setBaseUrl("https://www.google.com/maps/embed/v1/place");
    }
}
