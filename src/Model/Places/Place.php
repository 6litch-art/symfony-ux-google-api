<?php

namespace Google\Model\Places;

use Google\Builder\GmBuilder;
use Google\Builder\GmClient;
use Google\Model\Coordinates\LatLng;
use Symfony\Component\Config\Definition\Exception\Exception;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class Place extends GmClient
{
    public function __construct(?string $placeId, array $options = [], HttpClientInterface $client = null)
    {
        parent::__construct($client ?? GmBuilder::getInstance()->client ?? null, $options);
        $this->setOutputFormat(self::JsonEncoding);

        if ($this->guestIfValidPlaceId($placeId)) {
            $details = ($placeId ? $this->Details($placeId) : null);
            if ($details) {
                $status = $details['status'] ?? null;
                if ('OK' == $status && array_key_exists('result', $details)) {
                    $this->addOption($details['result']);
                }

                if ('OK' != $status) {
                    throw new Exception('Unexpected response from Google API: ' . $status);
                }
            }
        } else {
            $this->addOption('fields', 'geometry');
            $search = ($placeId ? $this->FindPlaceFromText($placeId) : null);
            if ($search) {
                $status = $search['status'] ?? null;
                if ('OK' == $status && array_key_exists('candidates', $search)) {
                    $this->addOption($search['candidates'][0]);
                }

                if ('OK' != $status) {
                    throw new Exception('Unexpected response from Google API: ' . $status);
                }
            }
        }
    }

    /**
     * @param string|null $placeId
     * @return false|int
     */
    public function guestIfValidPlaceId(?string $placeId)
    {
        if (!$placeId || !is_string($placeId)) {
            return 0;
        }

        $nchar = strlen($placeId);
        if ($nchar < 27 || $nchar >= 512) {
            return 0;
        }

        $vchar = '/^[a-zA-Z0-9_-]*$/';

        return preg_match($vchar, $placeId);
    }

    /**
     * @return float
     */
    public function getLat()
    {
        $latLng = $this->getLatLng();

        return $latLng->getLat();
    }

    /**
     * @return float
     */
    public function getLng()
    {
        $latLng = $this->getLatLng();

        return $latLng->getLng();
    }

    /**
     * @return LatLng
     */
    public function getLatLng()
    {
        $location = $this->getOptions()['geometry']['location'] ?? [];

        $lat = $location['lat'] ?? 0;
        $lng = $location['lng'] ?? 0;

        return new LatLng($lat, $lng);
    }

    public function FindPlaceFromText(string $input = null, string $inputtype = null, array $options = []): array
    {
        $options['input'] = $input ?? $options['input'] ?? $this->getOption('input');
        $options['inputtype'] = $inputtype ?? $options['inputtype'] ?? $this->getOption('inputtype') ?? 'textquery';

        if (!$options['input']) {
            throw new Exception('No input information provided.');
        }

        return $this->send('https://maps.googleapis.com/maps/api/place/findplacefromtext', $options) ?? [];
    }

    /**
     * @param LatLng|null $location
     * @param int|null $radius
     * @param array $options
     * @return array|mixed|string
     */
    public function NearbySearch(LatLng $location = null, int $radius = null /* meter */, array $options = [])
    {
        $options['radius'] = $radius ?? $options['radius'] ?? $this->getOption('radius');
        $options['location'] = $input ?? $options['location'] ?? $this->getOption('location');

        if (!($options['location'] ?? $options['radius'] ?? false)) {
            throw new Exception('No location/radius information provided.');
        }

        return $this->send('https://maps.googleapis.com/maps/api/place/nearbysearch', $options);
    }

    /**
     * @param string|null $query
     * @param array $options
     * @return array|mixed|string
     */
    public function TextSearch(string $query = null, array $options = [])
    {
        $options['query'] = $query ?? $options['query'] ?? $this->getOption('query');
        if (!$options['query']) {
            throw new Exception('No input information provided.');
        }

        return $this->send('https://maps.googleapis.com/maps/api/place/textsearch', $options);
    }

    /**
     * @param string|null $place_id
     * @param array $options
     * @return array|mixed|string
     */
    public function Details(string $place_id = null, array $options = [])
    {
        $options['place_id'] = $place_id ?? $options['place_id'] ?? $this->getOption('place_id');
        if (!$options['place_id']) {
            throw new Exception('No place id information provided.');
        }

        return $this->send('https://maps.googleapis.com/maps/api/place/details', $options);
    }
}
