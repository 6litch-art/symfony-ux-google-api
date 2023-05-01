<?php

namespace Google\Model\Coordinates;

/*

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#Point

*/

class Point
{
    private float $x;

    public function getX()
    {
        return $this->x;
    }

    public function setX($x)
    {
        $this->x = $x;
    }

    private float $y;

    public function getY()
    {
        return $this->y;
    }

    public function setY($y)
    {
        $this->y = $y;
    }

    public function __construct(float $x = 0.0, float $y = 0.0)
    {
        $this->setX($x);
        $this->setY($y);
    }

    public function equals(LatLng $that)
    {
        return $this == $that;
    }

    public function __toString(): string
    {
        return 'new google.maps.Size('.$this->x.', '.$this->y.')';
    }
}
