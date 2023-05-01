<?php

namespace Google\Model\Coordinates;

/*

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#Point

*/

/**
 *
 */
class Point
{
    private float $x;

    /**
     * @return float
     */
    public function getX()
    {
        return $this->x;
    }

    /**
     * @param $x
     * @return void
     */
    public function setX($x)
    {
        $this->x = $x;
    }

    private float $y;

    /**
     * @return float
     */
    public function getY()
    {
        return $this->y;
    }

    /**
     * @param $y
     * @return void
     */
    public function setY($y)
    {
        $this->y = $y;
    }

    public function __construct(float $x = 0.0, float $y = 0.0)
    {
        $this->setX($x);
        $this->setY($y);
    }

    /**
     * @param LatLng $that
     * @return bool
     */
    public function equals(LatLng $that)
    {
        return $this == $that;
    }

    public function __toString(): string
    {
        return 'new google.maps.Size(' . $this->x . ', ' . $this->y . ')';
    }
}
