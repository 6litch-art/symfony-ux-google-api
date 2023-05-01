<?php

namespace Google\Builder;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
interface GmObjectInterface
{
    public function getOpts(string $encoding);

    public function setOpts(array $opts): self;

    public function parseOpts(string $format): string;

    public function getArgs(array $args, string $encoding);

    public function parseArgs(array $args, string $format): string;

    public function getOption(string $key): ?string;

    public function addOption($key, $value): self;

    public function addListener(string $event, string $callback): self;

    public function getId(): ?string;

    public function setId(string $id);

    public function pop(string $key);

    public function getKey();

    public function setKey(?string $key): self;

    public function render(): string;

    public function getCachePath(): string;

    public function getCacheUrl(): string;

    public function cacheExists(array $opts = []): bool;

    public function cacheEnabled(): bool;
}
