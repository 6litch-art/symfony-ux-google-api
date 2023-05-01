<?php

namespace Google\Builder;

use Google\Model\Coordinates\LatLng;
use Google\Model\Maps\Map;
use Google\Model\Maps\Overlay\Marker;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
interface GmBuilderInterface
{
    public function addMap(string $id, Map $map): GmBuilder;

    public function addMarker(string $id, Marker $marker): GmBuilder;

    public function addLatLng(string $id, LatLng $latLng): GmBuilder;

    public function addListener($object, ?string $event = null, ?string $callback = null): GmBuilder;

    public function addEntry(string $entry): GmBuilder;

    public function isGranted($subject = null): bool;

    public function build(): bool;

    public function bind(string $id, GmObjectInterface $object): bool;

    public function unbind(GmObjectInterface $objectId): bool;

    public function import(array $rules): bool;

    public function export(): array;

    public static function getInstance(string $id);

    public static function getPublicDirectory(): ?string;

    public function uploadCache(string $path, string $contents, array $config = []);

    public function getCache(string $signature);

    public function getCachePath(string $signature, int $id = -1);

    public function getCacheUrl(string $signature);

    public function getCacheMetadata(string $signature);

    public function setCacheMetadata(string $signature, array $array, array $config = []);

    public function deleteCache(string $signature);

    public function cacheExists(string $signature, array $opts = []);

    public static function alreadyExists(string $id): bool;
}
