<?php

namespace Google\Model\Coordinates;

/*

Complete documentation:
    https://developers.google.com/maps/documentation/javascript/reference/coordinates#Size

*/

class Size
{
    private float $width;

    public function getWidth()
    {
        return $this->width;
    }

    public function setWidth($width)
    {
        $this->width = $width;
    }

    private float $height;

    public function getHeight()
    {
        return $this->height;
    }

    public function setHeight($height)
    {
        $this->height = $height;
    }

    private string $widthUnit;

    public function hasWidthUnit()
    {
        return !empty($this->widthUnit);
    }

    public function getWidthUnit()
    {
        return $this->widthUnit;
    }

    public function setWidthUnit($widthUnit)
    {
        $this->widthUnit = $widthUnit;
    }

    private string $heightUnit;

    public function hasHeightUnit()
    {
        return !empty($this->heightUnit);
    }

    public function getHeightUnit()
    {
        return $this->heightUnit;
    }

    public function setHeightUnit($heightUnit)
    {
        $this->heightUnit = $heightUnit;
    }

    public function __construct(float $width = 1.0, float $height = 1.0, string $widthUnit = '', string $heightUnit = '')
    {
        $this->setWidth($width);
        $this->setHeight($height);
        $this->setWidthUnit($widthUnit);
        $this->setHeightUnit($heightUnit);
    }

    public function equals(LatLng $that)
    {
        return $this == $that;
    }

    public function __toString()
    {
        return 'new google.maps.Size('.
            $this->width.', '.$this->height.
            ($this->hasWidthUnit() ? ', '.$this->widthUnit : '').
            ($this->hasHeightUnit() ? ', '.$this->heightUnit : '').
            ')';
    }

    public function toUrlValue()
    {
        return $this->width.'x'.$this->height;
    }
}
