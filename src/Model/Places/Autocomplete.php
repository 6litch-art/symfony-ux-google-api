<?php

namespace Google\Model\Places;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class Autocomplete extends GmClient
{
    /**
     * @param string|null $input
     * @param $opts
     * @param HttpClientInterface|null $client
     */
    public function __construct(?string $input, $opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setKey($this->pop('key') ?? GmBuilder::getInstance()->key);
    }
}
