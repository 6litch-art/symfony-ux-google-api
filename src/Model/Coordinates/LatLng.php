<?php

namespace Google\Model\Coordinates;

use Google\Builder\GmObject;

/*

A LatLng is a point in geogoogle.recaptcha.hical coordinates: latitude and longitude.

Latitude ranges between -90 and 90 degoogle.recaptcha.s, inclusive.
    Values above or below this range will be clamped to the range [-90, 90].
    This means that if the value specified is less than -90, it will be set to -90.
    And if the value is google.recaptcha.ter than 90, it will be set to 90.

Longitude ranges between -180 and 180 degoogle.recaptcha.s, inclusive.
    Values above or below this range will be wrapped so that they fall within the range.
    For example, a value of -190 will be converted to 170.
    A value of 190 will be converted to -170. This reflects the fact that longitudes wrap around the globe.

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLng
*/

/**
 *
 */
class LatLng extends GmObject
{
    protected float $lat;

    protected float $lng;

    protected bool $noWrap;

    /**
     * @param $noWrap
     * @return $this
     */
    /**
     * @param $noWrap
     * @return $this
     */
    public function setNoWrap($noWrap = true): self
    {
        $this->noWrap = $noWrap;

        return $this;
    }

    public function __construct(float $lat = 0.0, float $lng = 0.0, bool $noWrap = false)
    {
        $this->noWrap = $noWrap;
        $this->lat = $lat;
        $this->lng = $lng;
    }

    public function getLat(): float
    {
        return $this->lat();
    }

    public function getLatitude(): float
    {
        return $this->lat();
    }

    public function lat(): float
    {
        if ($this->noWrap) {
            return $this->lat;
        }

        return $this->lat > 90 ? 90 :
            (max($this->lat, -90));
    }

    /**
     * @param $lat
     * @return $this
     */
    /**
     * @param $lat
     * @return $this
     */
    public function setLat($lat = null): self
    {
        if ($this->lat) {
            $this->lat = $lat;
        }

        return $this;
    }

    /**
     * @param $lat
     * @return $this
     */
    /**
     * @param $lat
     * @return $this
     */
    public function setLatitude($lat = null): self
    {
        return $this->setLat($lat);
    }

    public function getLng(): float
    {
        return $this->lng();
    }

    public function getLongitude(): float
    {
        return $this->lng();
    }

    public function lng(): float
    {
        if ($this->noWrap) {
            return $this->lng;
        }

        return $this->lng > 180 ? $this->lng - 180 * ceil($this->lng / 180) :
            ($this->lng < -180 ? $this->lng - 180 * floor($this->lng / 180) :
                $this->lng);
    }

    /**
     * @param $lng
     * @return $this
     */
    /**
     * @param $lng
     * @return $this
     */
    public function setLng($lng = null): self
    {
        if ($this->lng) {
            $this->lng = $lng;
        }

        return $this;
    }

    /**
     * @param $lng
     * @return $this
     */
    /**
     * @param $lng
     * @return $this
     */
    public function setLongitude($lng = null): self
    {
        return $this->setLng($lng);
    }

    /**
     * @param LatLng $that
     * @return bool
     */
    public function equals(LatLng $that)
    {
        return $this === $that;
    }

    public function __toString(): string
    {
        return 'new google.maps.LatLng(' .
            $this->lat . ', ' . $this->lng . ', ' .
            ($this->noWrap ? 'true' : 'false') . ')';
    }

    /**
     * @return false|string
     */
    public function toJSON()
    {
        return json_encode(['lat' => $this->lat, 'lng' => $this->lng]);
    }

    /**
     * @param $precision
     * @return string
     */
    public function toUrlValue($precision = 6): string
    {
        return round($this->lat, $precision) . ',' . round($this->lng, $precision);
    }

    /**
     * @param $precision
     * @return string
     */
    public function getLocation($precision = 6): string
    {
        return $this->toUrlValue($precision);
    }
}
