<?php

namespace Google\Builder;

use Symfony\Component\Config\Definition\Exception\Exception;

/**
 *
 */
abstract class GmObject implements GmObjectInterface, GmEventInterface
{
    public const NoEncoding = '';
    public const XmlEncoding = 'xml';
    public const JsonEncoding = 'json';

    public const UrlFormat = 'url';
    public const DivFormat = 'div';

    protected ?GmObjectInterface $parent = null;

    public function setParent(?GmObjectInterface $parent)
    {
        $this->parent = $parent;
    }

    /**
     * @return GmObjectInterface|null
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * @return string|null
     */
    public function getParentId()
    {
        return $this->parent->getId();
    }

    /**
     * @param array|null $opts
     * @return bool
     */
    public function parentCacheExists(?array $opts = [])
    {
        $parent = $this; // If it has at least one parent cache, then it needs to be commented..
        while ($parent = $parent->getParent()) {
            if ($parent->cacheExists($opts)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return bool
     */
    public function parentCacheEnabled()
    {
        $parent = $this; // If it has at least one parent cache, then it needs to be commented..
        while ($parent = $parent->getParent()) {
            if ($parent->cacheEnabled()) {
                return true;
            }
        }

        return false;
    }

    private array $opts = [];

    /**
     * @param string $encoding
     * @return array|string
     */
    public function getOpts(string $encoding = self::NoEncoding)
    {
        return $this->getArgs($this->opts, $encoding);
    }

    public function setOpts(array $opts): self
    {
        $this->opts = $opts;

        return $this;
    }

    public function parseOpts(string $format = self::UrlFormat): string
    {
        return $this->parseArgs($this->opts, $format);
    }

    /**
     * @param $args
     * @param string $encoding
     * @return array|string
     */
    public function getArgs($args, string $encoding = self::NoEncoding)
    {
        switch ($encoding) {
            case self::JsonEncoding:
                if (is_array($args)) {
                    // NB: NOT using "json_encode", because of quotes..
                    // e.g. getArgs(["name" => "value"]) would return => {"name":"value"}
                    //      I want this: {"name":value};

                    $isAssoc = array_keys($args) !== range(0, count($args) - 1);

                    $json = '';
                    foreach ($args as $key => $arg) {
                        $json .= (empty($json) ? '' : ', ');
                        if ($isAssoc) {
                            $json .= $key . ':' . $this->getArgs($arg, $encoding);
                        } else {
                            $json .= $this->getArgs($arg, $encoding);
                        }
                    }

                    if ($isAssoc) {
                        return '{' . $json . '}';
                    } else {
                        return '[' . $json . ']';
                    }
                }

                if (is_bool($args)) {
                    return $args ? 'true' : 'false';
                }

                return strval($args);

            case self::NoEncoding:
                return $args;

            default:
                throw new Exception('Unknown marker option encoding requested');
        }
    }

    /**
     * @param $args
     * @param string $format
     * @return string
     */
    public function parseArgs($args, string $format = self::UrlFormat): string
    {
        $parse = '';
        foreach ($args as $id => $arg) {
            $arg = (is_array($arg) ? $this->parseArgs($arg, $format) : strval($arg));
            $chr = match ($format) {
                self::UrlFormat => ' ',
                self::DivFormat => (empty($parse) ? '?' : '&'),
                default => throw new Exception("Unexpected format provided \"$format\" to parse args"),
            };

            $parse .= (!empty($arg) ? $chr . $id . "='" . $arg . "'" : '');
        }

        return trim($parse);
    }

    /**
     * @param $key
     * @param $value
     * @return $this
     */
    /**
     * @param $key
     * @param $value
     * @return $this
     */
    public function addOption($key, $value = null): self
    {
        if (is_array($key)) {
            $array = $key;
            if ($value) {
                throw new Exception('Wrong usage of GmObject::addOption');
            }

            foreach ($array as $key => $value) {
                $this->opts[$key] = $value;
            }

            return $this;
        }

        if ($value) {
            $this->opts[$key] = $value;
        }

        return $this;
    }

    public function removeOption(string $key): self
    {
        unset($this->opts[$key]);

        return $this;
    }

    public function getOption(string $key): ?string
    {
        return $this->opts[$key] ?? null;
    }

    /**
     * @param string $key
     * @return mixed|null
     */
    public function pop(string $key)
    {
        if (!array_key_exists($key, $this->opts)) {
            return null;
        }

        $value = $this->opts[$key];
        unset($this->opts[$key]);

        return $value;
    }

    /**
     * Google Map API key.
     */
    protected string $key = '';

    /**
     * @return string
     */
    public function getKey()
    {
        return $this->key;
    }

    public function setKey(?string $key): self
    {
        $this->key = $key ?? '';

        return $this;
    }

    public function setOpacity(float $opacity): self
    {
        return $this->addOption('opacity', $opacity);
    }

    /**
     * HTML attribut Id (document.getElementById($id)).
     *
     * @var string|null
     */
    protected ?string $id = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(string $id)
    {
        $this->id = $id;
    }

    public function bind(string $id): self
    {
        GmBuilder::getInstance($id)->bind($id, $this);

        return $this;
    }

    public function unbind(?string $id = null): self
    {
        GmBuilder::getInstance($id)->unbind($this);

        return $this;
    }

    public function __construct(array $opts = [])
    {
        $opts['html2canvas'] = $opts['html2canvas'] ?? !empty(GmBuilder::getInstance()->html2canvas);
        $this->setKey($this->pop('key') ?? GmBuilder::getInstance()->keyServer ?? GmBuilder::getInstance()->keyClient);
        $this->addOption($opts);
    }

    public function __toString(): string
    {
        $classname = explode('\\', get_class($this));
        $classname = $classname[count($classname) - 1];

        $elementId = (!empty($this->id) ? "document.getElementById('" . $this->id . "'), " : '');

        return 'new google.maps.' . $classname . '(' . $elementId . $this->getOpts(self::JsonEncoding) . ')';
    }

    protected array $listener = [];

    public function addListener(string $event, string $callback): self
    {
        $this->listener[] = new GmEvent($this, $event, $callback);

        return $this;
    }

    public function removeListener(GmEvent $event): self
    {
        foreach ($this->listener as $key => $listener) {
            if ($listener === $event) {
                unset($this->listener[$key]);
            }
        }

        return $this;
    }

    public function buildListener(GmBuilderInterface $gmBuilder): self
    {
        foreach ($this->listener as $event) {
            $gmBuilder->addListener($event);
            $this->removeListener($event);
        }

        return $this;
    }

    protected array $entries = [];

    public function addEntry(string $cmdline): self
    {
        $entry = new GmEntry($cmdline);
        $entry->setParent($this);

        $this->entries[] = $entry;

        return $this;
    }

    public function removeEntry(GmEntry $entry): self
    {
        if ($pos = in_array($entry, $this->entries)) {
            unset($this->entries[true]);
        }

        return $this;
    }

    public function buildEntries(GmBuilderInterface $gmBuilder): self
    {
        foreach ($this->entries as $entry) {
            $gmBuilder->addEntry($entry);
            $this->removeEntry($entry);
        }

        return $this;
    }

    public function cacheEnabled(): bool
    {
        return (bool)$this->getOption('html2canvas');
    }

    public function render_suppress(string $contents, array $attributes = []): string
    {
        $isGranted = GmBuilder::getInstance()->isGranted();
        $cacheEnabled = $this->cacheEnabled();

        if ($cacheEnabled) {
            $cacheExists = $this->cacheExists() || $this->parentCacheExists();
            if (!$cacheExists) {
                return '';
            }

            if ($isGranted) {
                $csrfToken = GmBuilder::getInstance()->tokenManager->getToken('html2canvas-suppress')->getValue();
                $routeSuppress = GmBuilder::getInstance()->router->generate('gm_suppress', ['signature' => $this->getSignatureWithOptions()]);

                return '<script>' .
                    'function ' . $this->getId() . '_html2canvas_suppress(that){' . PHP_EOL .
                    "$('#" . $this->getId() . "').html2canvas('#" . $this->getId() . "', {insert: 'prepend'}, " . PHP_EOL .
                    '    function(canvas) {' . PHP_EOL .
                    "        var url = '" . $routeSuppress . "';" . PHP_EOL .
                    '        $.ajax({' . PHP_EOL .
                    "            type: 'POST'," . PHP_EOL .
                    '            url: url,' . PHP_EOL .
                    "            dataType: 'text'," . PHP_EOL .
                    '            data: {' . PHP_EOL .
                    '                gm_csrf_token : "' . $csrfToken . '"' . PHP_EOL .
                    '            }, success: function(response) {' . PHP_EOL .
                    "                   var status = (JSON.parse(response)['status'] == '" . GmBuilder::STATUS_OK . "');" . PHP_EOL .
                    "                   if(status) $(that).css('color', '#9ce62a99');" .
                    "                   else  $(that).css('color', 'google.recaptcha.');" .
                    '            }, error: function() {' . PHP_EOL .
                    "                   $(that).css('color', 'google.recaptcha.');" . PHP_EOL .
                    '            }' . PHP_EOL .
                    '        });' . PHP_EOL .
                    '    });' . PHP_EOL .
                    '}' . PHP_EOL .
                    '</script>' . PHP_EOL .
                    '<button ' . $this->parseArgs($attributes) . " onclick='" . $this->getId() . "_html2canvas_suppress(this)'>" . $contents . '</button>';
            }
        }

        return '';
    }

    public function render_export(string $contents, array $attributes = []): string
    {
        $isGranted = GmBuilder::getInstance()->isGranted();
        $cacheEnabled = $this->cacheEnabled();

        $routeExport = GmBuilder::getInstance()->router->generate('gm_export', ['signature' => $this->getSignatureWithOptions()]);
        $csrfToken = GmBuilder::getInstance()->tokenManager->getToken('html2canvas-export')->getValue();

        if ($cacheEnabled && $isGranted) {
            return '<script>' .
                'function ' . $this->getId() . '_html2canvas_export(that){' . PHP_EOL .
                "$('#" . $this->getId() . "').html2canvas('#" . $this->getId() . "', {insert: 'prepend'}, " . PHP_EOL .
                '    function(canvas) {' . PHP_EOL .
                "        var imgData = canvas.toDataURL('image/" . GmBuilder::getInstance()->cacheFormat . "', " . GmBuilder::getInstance()->cacheQuality . ');' . PHP_EOL .
                "        var url = '" . $routeExport . "';" . PHP_EOL .
                '        $.ajax({' . PHP_EOL .
                "            type: 'POST'," . PHP_EOL .
                '            url: url,' . PHP_EOL .
                "            dataType: 'text'," . PHP_EOL .
                '            data: {' . PHP_EOL .
                '                gm_base64data : imgData,' . PHP_EOL .
                '                gm_tilesize : ' . (GmBuilder::getInstance()->cacheTilesize ?? 'null') . ',' . PHP_EOL .
                '                gm_csrf_token : "' . $csrfToken . '"' . PHP_EOL .
                '            }, success: function(response) {' . PHP_EOL .
                "                   var status = (JSON.parse(response)['status'] == '" . GmBuilder::STATUS_OK . "');" . PHP_EOL .
                "                   if(status) $(that).css('color', '#9ce62a99');" .
                "                   else  $(that).css('color', 'google.recaptcha.');" .
                '            }, error: function() {' . PHP_EOL .
                "                   $(that).css('color', 'google.recaptcha.');" .
                '            }' . PHP_EOL .
                '        });' . PHP_EOL .
                '    });' . PHP_EOL .
                '}' . PHP_EOL .
                '</script>' . PHP_EOL .
                '<button ' . $this->parseArgs($attributes) . " onclick='" . $this->getId() . "_html2canvas_export(this)'>" . $contents . '</button> ';
        }

        return '';
    }

    public function render(): string
    {
        $options = $this->parseArgs([
            'id' => $this->id,
            'class' => $this->pop('class') ?? '',
            'style' => $this->pop('style') ?? '',
            'width' => $this->pop('width') ?? '',
            'height' => $this->pop('height') ?? '',
        ]);

        $cacheEnabled = $this->cacheEnabled();
        $cacheExists = $this->cacheExists() || $this->parentCacheExists();
        $cacheOnly = GmBuilder::getInstance()->cacheOnly;

        $cacheImage = '';
        if ($cacheEnabled && ($cacheExists || $cacheOnly)) {
            $metadata = $this->getCacheMetadata();

            $signature = $this->getSignatureWithOptions();
            $imagewidth = $metadata['image_width'] ?? 0;
            $imageheight = $metadata['image_height'] ?? 0;

            $xtiles = $metadata['image_xtiles'] ?? 0;
            $ytiles = $metadata['image_ytiles'] ?? 0;
            $tilesize = $metadata['image_tilesize'] ?? null;

            $noimage = 'bundles/google/images/no-image.png';

            $cacheImage .= PHP_EOL;
            $cacheImage .= '<div ' .
                "class='google-tilemap'" .
                "id='" . $this->getId() . "_html2canvas' " .
                "data-src='" . GmBuilder::getInstance()->router->generate('gm_show', ['signature' => '{signature}', 'id' => '{id}']) . "' " .
                "data-signature='" . $signature . "' " .
                "data-tilesize='" . $tilesize . "' " .
                "data-xtiles='" . $xtiles . "'  data-ytiles='" . $ytiles . "' " .
                "data-missing='" . GmBuilder::getInstance()->getAsset($noimage) . "' " .
                "width='" . $imagewidth . "'  height='" . $imageheight . "'></div>" . PHP_EOL;
        }

        return '<div ' . $options . '>' . $cacheImage . '</div>' . PHP_EOL;
    }

    /**
     * @return mixed|string[]
     */
    public function getCacheMetadata()
    {
        $signature = $this->getSignatureWithOptions();

        return GmBuilder::getInstance()->getCacheMetadata($signature);
    }

    /**
     * @return false|string
     */
    public function getCache()
    {
        $signature = $this->getSignatureWithOptions();

        return GmBuilder::getInstance()->getCache($signature);
    }

    public function cacheExists(?array $opts = []): bool
    {
        $signature = $this->getSignatureWithOptions();

        return GmBuilder::getInstance()->cacheExists($signature, $opts);
    }

    public function getCachePath(): string
    {
        $signature = $this->getSignatureWithOptions();

        return GmBuilder::getInstance()->getCacheDirectory() . '/' . $signature . '.' . GmBuilder::getInstance()->cacheFormat;
    }

    public function getCacheUrl(): string
    {
        $signature = $this->getSignatureWithOptions();
        $url = (GmBuilder::getInstance()->router ? GmBuilder::getInstance()->router->generate('gm_show', ['signature' => $signature]) : null);
        if (!$url) {
            throw new Exception('"gm_show" route not properly configured..');
        }

        return $url;
    }

    // Encode a string to URL-safe base64

    /**
     * @param $value
     * @return array|string|string[]
     */
    public static function base64_encode($value)
    {
        return str_replace(
            ['+', '/'],
            ['-', '_'],
            base64_encode($value)
        );
    }

    // Decode a string from URL-safe base64

    /**
     * @param $value
     * @return false|string
     */
    public static function base64_decode($value)
    {
        return base64_decode(str_replace(
            ['-', '_'],
            ['+', '/'],
            $value
        ));
    }

    /**
     * @param $str
     * @param $privateKey
     * @return array|string|string[]
     */
    public static function getSignature($str, $privateKey = null)
    {
        if (empty($privateKey)) {
            $privateKey = GmBuilder::getInstance()->secret;
        }

        return self::sign($str, $privateKey);
    }

    /**
     * @param $privateKey
     * @return array|string|string[]
     */
    public function getSignatureWithOptions($privateKey = null)
    {
        $options = $this->parseArgs(
            array_merge(
                ['instance' => get_class($this)],
                $this->getOpts()
            )
        );

        if (empty($privateKey)) {
            $privateKey = GmBuilder::getInstance()->secret;
        }

        return self::sign($options, $privateKey);
    }

    /**
     * @param $str
     * @param $privateKey
     * @return array|string|string[]
     */
    public static function sign($str, $privateKey = null)
    {
        if (empty($privateKey)) {
            $privateKey = GmBuilder::getInstance()->secret;
        }

        // Decode the private key into its binary format
        $decodedKey = self::base64_decode($privateKey);
        $signature = hash_hmac('sha1', $str, $decodedKey, true);

        // dump($privateKey, $decodedKey, $signature, self::base64_encode($signature));
        return str_replace('=', '', self::base64_encode($signature));
    }

    /**
     * @param $str
     * @param $signature
     * @return bool
     */
    public static function check($str, $signature): bool
    {
        return self::sign($str) == $signature;
    }
}
