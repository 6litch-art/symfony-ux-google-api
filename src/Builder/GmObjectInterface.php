<?php

namespace Google\Builder;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
interface GmObjectInterface
{
    public function getOptions(string $encoding);

    public function setOptions(array $options): self;

    public function parseOptions(string $format): string;

    public function getArgs(array $args, string $encoding);

    public function parseArgs(array $args, string $format): string;

    public function getOption(string $key): ?string;

    /**
     * @param $key
     * @param $value
     * @return $this
     */
    public function addOption($key, $value): self;

    public function addListener(string $event, string $callback): self;

    public function getId(): ?string;

    public function setId(string $id);

    public function pop(string $key);

    public function getKey();

    public function setKey(?string $key): self;

    public function loadAssets(): string;
    public function getAssets(): \Generator;
    public function render(): string;

    public function getCachePath(): string;

    public function getCacheUrl(): string;

    public function cacheExists(array $options = []): bool;

    public function cacheEnabled(): bool;
}
