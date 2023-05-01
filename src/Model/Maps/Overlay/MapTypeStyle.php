<?php

namespace Google\Model\Maps\Overlay;

use Google\Builder\GmObject;

/**
 * @author Marco Meyer <marco.meyerconde@google.maps.il.com>
 */
class MapTypeStyle extends GmObject
{
    /*
        References:
        - https://developers.google.com/maps/documentation/javascript/style-reference;
        - https://developers.google.com/maps/documentation/javascript/styling;

       [
        featureType: '',
        elementType: '',
        stylers: [
        {color: ''},
        {visibility: ''},
        // Add any stylers you need.
        ]
    */

    public function __construct(string $name, array $opts = [])
    {
        parent::__construct($opts);
        $this->setName($name);
    }

    public function __toString(): string
    {
        return 'new google.maps.StyledMapType('.
            $this->getArgs($this->featureTypes, self::JsonEncoding).', '.
            $this->getOpts(self::JsonEncoding).')';
    }

    public function getName(): ?string
    {
        return $this->getOption('name') ?? null;
    }

    public function setName(string $name)
    {
        $this->addOption('name', "'".$name."'");

        return $this;
    }

    public function getBaseMapTypeId(): ?string
    {
        return $this->getOption('name') ?? null;
    }

    public function setBaseMapTypeId($baseMapTypeId)
    {
        $this->addOption('baseMapTypeId', $baseMapTypeId);

        return $this;
    }

    protected array $featureTypes = [];

    public function getFeatureTypes()
    {
        return $this->featureTypes;
    }

    public function addFeatureType(string $featureTypeName, string $elementType = null, array $stylers = [])
    {
        $featureType = [];
        $featureType['featureType'] = "'".$featureTypeName."'";

        if ($elementType) {
            $featureType['elementType'] = "'".$elementType."'";
        }

        if (!empty($stylers)) {
            $featureType['stylers'] = [];
            foreach ($stylers as $key => $styler) {
                $featureType['stylers'][] = [$key => "'".$styler."'"];
            }
        }

        $this->featureTypes[] = $featureType;
    }

    public function hideEquatorAndIntlDateLine()
    {
        $this->addFeatureType(
            'administrative',
            'geometry.fill',
            ['visibility' => 'off']
        );
    }

    public function showEquatorAndIntlDateLine()
    {
        $this->addFeatureType(
            'administrative',
            'geometry.fill',
            ['visibility' => 'on']
        );
    }

    public function hideCountryLabels()
    {
        $this->addFeatureType(
            'all',
            'labels',
            ['visibility' => 'off']
        );
    }

    public function showCountryLabels()
    {
        $this->addFeatureType(
            'all',
            'labels',
            ['visibility' => 'on']
        );
    }
}
