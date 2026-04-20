<?php

namespace Google\Model\Maps;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@gmail.com>
 */
class MapEmbed extends GmClient
{
    /**
     * @param $options
     * @param HttpClientInterface|null $client
     */
    public function __construct($options = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $options);
        $this->setBaseUrl('https://www.google.com/maps/embed/v1/place');
    }
}
