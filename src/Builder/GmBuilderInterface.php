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
    public function addMap     (string $id, Map $map): GmBuilder;
    public function addMarker  (string $id, Marker $marker): GmBuilder;
    public function addLatLng  (string $id, LatLng $latLng): GmBuilder;
    public function addListener($object, ?string $event = null, ?string $callback = null): GmBuilder;
    public function addEntry   (string $cmd): GmBuilder;

    public function build(): bool;
    public function bind(string $id, GmObjectInterface $object): bool;
    public function unbind(GmObjectInterface $object): bool;

    public function import(array $rules): bool;
    public function export(): array;

    public static function getInstance(string $id);
    public static function getPublicDirectory(): ?string;
    public function getCacheDirectory(): ?string;

    public function uploadCache(string $path, string $contents, array $config = []);
    public function getCache(string $file);
    public function getCachePath(string $signature, int $index = -1);
    public function getCacheUrl(string $signature);
    public function getCacheMetadata(string $signature);
    public function setCacheMetadata(string $signature, array $array, array $config = []);
    public function deleteCache(string $signature);
    public function cacheExists(string $file, array $opts = []);

    public static function alreadyExists(string $id): bool;
}