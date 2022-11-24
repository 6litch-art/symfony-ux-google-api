<?php

namespace Google\Model\Places;

use Google\Builder\GmClient;
use Google\Builder\GmBuilder;

use Google\Model\Coordinates\LatLng;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Config\Definition\Exception\Exception;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class Place extends GmClient
{
    public function __construct(?string $placeId, array $opts = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client, $opts);
        $this->setOutputFormat(self::JsonEncoding);

        if($this->guestIfValidPlaceId($placeId)) {

            $details = ($placeId ? $this->Details($placeId) : null);
            if ($details) {

                $status = $details["status"] ?? null;
                if ($status == "OK" && array_key_exists("result", $details))
                    $this->addOption($details["result"]);

                if ($status != "OK")
                    throw new Exception("Unexpected response from Google API: " . $status);
            }

        } else {

            $this->addOption("fields", "geometry");
            $search = ($placeId ? $this->FindPlaceFromText($placeId) : null);
            if ($search) {

                $status = $search["status"] ?? null;
                if ($status == "OK" && array_key_exists("candidates", $search))
                    $this->addOption($search["candidates"][0]);

                if ($status != "OK")
                    throw new Exception("Unexpected response from Google API: " . $status);
            }
        }
    }

    public function guestIfValidPlaceId(?string $placeId) {

        if(!$placeId || !is_string($placeId)) return 0;

        $nchar = strlen($placeId);
        if($nchar < 27 || $nchar >= 512) return 0;

        $vchar = "/^[a-zA-Z0-9_-]*$/";
        return preg_match($vchar, $placeId);
    }

    public function getLat()
    {
        $latLng = $this->getLatLng();
        return $latLng->getLat();
    }

    public function getLng()
    {
        $latLng = $this->getLatLng();
        return $latLng->getLng();
    }

    public function getLatLng() {

        $location = $this->getOpts()["geometry"]["location"] ?? [];

        $lat = $location["lat"] ?? 0;
        $lng = $location["lng"] ?? 0;

        return new LatLng($lat, $lng);
    }

    public function FindPlaceFromText(string $input = null, string $inputtype = null, array $opts = []): array
    {
        $opts["input"]     = $input     ?? $opts["input"]     ?? $this->getOption("input");
        $opts["inputtype"] = $inputtype ?? $opts["inputtype"] ?? $this->getOption("inputtype") ?? "textquery";

        if(!$opts["input"])
            throw new Exception("No input information provided.");

        return $this->send("https://maps.googleapis.com/maps/api/place/findplacefromtext", $opts);
    }

    public function NearbySearch(LatLng $location = null, int $radius = null /* meter */, array $opts = [])
    {
        $opts["radius"]   = $radius ?? $opts["radius"]   ?? $this->getOption("radius");
        $opts["location"] = $input  ?? $opts["location"] ?? $this->getOption("location");

        if ( !($opts["location"] ?? $opts["radius"] ?? false) )
            throw new Exception("No location/radius information provided.");

        return $this->send("https://maps.googleapis.com/maps/api/place/nearbysearch", $opts);
    }

    public function TextSearch(string $query = null, array $opts = [])
    {
        $opts["query"] = $query ?? $opts["query"] ?? $this->getOption("query");
        if (!$opts["query"])
            throw new Exception("No input information provided.");

        return $this->send("https://maps.googleapis.com/maps/api/place/textsearch", $opts);
    }

    public function Details(string $place_id = null, array $opts = [])
    {
        $opts["place_id"] = $place_id ?? $opts["place_id"] ?? $this->getOption("place_id");
        if (!$opts["place_id"])
            throw new Exception("No place id information provided.");

        return $this->send("https://maps.googleapis.com/maps/api/place/details", $opts);
    }
}
