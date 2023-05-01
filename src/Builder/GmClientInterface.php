<?php

namespace Google\Builder;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
interface GmClientInterface
{
    public function getBaseUrl(): string;

    public function setBaseUrl(string $baseUrl): self;

    public function getOutputFormat(): string;

    /**
     * @param $outputFormat
     * @return $this
     */
    /**
     * @param $outputFormat
     * @return $this
     */
    public function setOutputFormat($outputFormat): self;

    public function getParameters(): mixed;

    public function getRequest(string $baseUrl, array $opts): string;

    public function send(string $baseUrl, array $opts, int $expiration);
}
