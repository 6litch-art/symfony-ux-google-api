<?php

namespace Google\Builder;

use Base\Routing\RouterInterface;
use Google\Model\Coordinates\LatLng;
use Google\Model\Maps\Map;
use Google\Model\Maps\MapEmbed;
use Google\Model\Maps\MapStatic;
use Google\Model\Maps\MapUrl;
use Google\Model\Maps\Overlay\MapTypeStyle;
use Google\Model\Maps\Overlay\Marker;
use Google\Model\Places\Place;
use League\Flysystem\UnableToDeleteFile;
use League\Flysystem\UnableToReadFile;
use League\Flysystem\UnableToRetrieveMetadata;
use League\Flysystem\UnableToWriteFile;
use League\FlysystemBundle\Lazy\LazyFactory;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Config\Definition\Exception\Exception;
use Symfony\Component\HttpFoundation\RequestStack;

// use Google\Model\StaticMap;
// use Google\Model\EmbedMap;
// use Google\Model\Elevation;
// use Google\Model\StreetView;

use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Twig\Environment;

class GmBuilder implements GmBuilderInterface
{
    protected bool $enable;

    /**
     * @var Environment
     */
    public RequestStack $requestStack;

    public const STATUS_OK = 'OK';
    public const STATUS_BAD = 'BAD';
    public const STATUS_NOCLIENT = 'NOCLIENT';

    public $callback;
    public $libraries;
    public $version;

    public HttpClientInterface $client;
    public CacheInterface $cache;
    public $cacheDir;
    public $cachePool;
    public string $cachePublic;
    public $cacheLifetime;
    public $cacheOnly;
    public $cacheControl;
    public $cacheFormat;
    public $cacheQuality;
    public $cacheTilesize;
    public mixed $filesystem;
    public $html2canvas;
    public $tilemap;

    public CsrfTokenManagerInterface $tokenManager;

    public Environment $environment;

    public RouterInterface $router;

    public Environment $twig;

    /**
     * construct.
     */
    public function __construct(
        KernelInterface           $kernel,
        Environment               $twig,
        CacheInterface            $cache,
        LazyFactory               $lazyFactory,
        RequestStack              $requestStack,
        HttpClientInterface       $client,
        Security                  $security,
        CsrfTokenManagerInterface $csrfTokenManager
    )
    {
        self::$_instance = $this;

        //
        // Autowiring
        //
        $this->cache = $cache;
        $this->client = $client;
        $this->tokenManager = $csrfTokenManager;
        $this->router = $kernel->getContainer()->get('router');
        $this->environment = $kernel->getEnvironment(); // "dev", "prod", etc..
        $this->security = $security;
        $this->requestStack = $requestStack;

        //
        // Get variables
        //
        $this->enable = $kernel->getContainer()->getParameter('google.maps.enable');
        $this->cachePool = $kernel->getContainer()->getParameter('google.maps.cache_pool');
        $this->cacheLifetime = $kernel->getContainer()->getParameter('google.maps.cache_lifetime');
        $this->cacheOnly = $kernel->getContainer()->getParameter('google.maps.cache_only');
        $this->cacheControl = $kernel->getContainer()->getParameter('google.maps.cache_control');
        $this->cacheQuality = $kernel->getContainer()->getParameter('google.maps.cache_quality');
        $this->cachePublic = $this->getAsset($kernel->getContainer()->getParameter('google.maps.cache_public'));

        $this->cacheTilesize = $kernel->getContainer()->getParameter('google.maps.cache_tilesize');
        if ($this->cacheTilesize < 1) {
            $this->cacheTilesize = null;
        }

        $this->cacheFormat = $kernel->getContainer()->getParameter('google.maps.cache_format');
        if ('txt' == $this->cacheFormat) {
            throw new Exception('Cache format cannot be text');
        }

        $this->keyClient = $kernel->getContainer()->getParameter('google.maps.apikey.client');
        $this->keyServer = $kernel->getContainer()->getParameter('google.maps.apikey.server');
        $this->secret = $kernel->getContainer()->getParameter('google.maps.secret');
        $this->callback = $kernel->getContainer()->getParameter('google.maps.callback');
        $this->libraries = $kernel->getContainer()->getParameter('google.maps.libraries');
        $this->version = $kernel->getContainer()->getParameter('google.maps.version');

        $this->filesystem = $lazyFactory->createStorage(
            $kernel->getContainer()->getParameter('google.maps.cache'),
            'google.maps'
        );

        $this->twig = $twig;
    }

    /**
     * @var bool
     */
    public function isEnabled()
    {
        return $this->enable;
    }

    public ?string $keyClient;

    public function getClientKey()
    {
        return $this->keyClient;
    }

    public function setClientKey($key)
    {
        $this->keyClient = $key;
    }

    public ?string $keyServer;

    public function getServerKey()
    {
        return $this->keyServer;
    }

    public function setServerKey($keyServer)
    {
        $this->keyServer = $keyServer;
    }

    public ?string $secret;

    public function getSecret()
    {
        return $this->secret;
    }

    public function setSecret($secret)
    {
        $this->secret = $secret;
    }

    private static $_instance = null;
    private static array $_instanceId = [];

    public static function getInstance(string $id = null)
    {
        if (null == $id) {
            return self::$_instance;
        }

        return self::$_instanceId[$id] ?? null;
    }

    public static function alreadyExists(string $id): bool
    {
        return array_key_exists($id, self::$_instanceId);
    }

    public Security $security;

    public static function isReady()
    {
        return null != self::$_instance;
    }

    public static function getPublicDirectory(): string
    {
        return dirname(__FILE__, 6) . '/public/bundles/google';
    }

    public function getCacheDirectory(): ?string
    {
        return $this->getAsset($this->cachePool ?? null);
    }

    public function addListener($object, ?string $event = null, ?string $callback = null): self
    {
        if (is_string($object)) {
            $id = $object;
            $object = $this->getInstance($id);
            if (!$object) {
                throw new Exception('Unknown GmObject #ID: "' . $id . '"');
            }
        }

        if (!$object instanceof GmObjectInterface) {
            throw new Exception("Unexpected type: $object must implement GmObjectInterface");
        }

        if ($object instanceof GmEvent) {
            $gmEvent = $object;
            $id = $object->getParentId();
            $event = $object->getEvent();
            $callback = $object->getCallback();
        } else {
            if (!$event) {
                throw new Exception("Empty event provided for \"$object\"");
            }
            if (!$callback) {
                throw new Exception("Empty callback provided for \"$object\"");
            }

            $gmEvent = new GmEvent($object, $event, $callback);
            $id = $object->getId();
        }

        $id = $id . '_' . $event . '_' . md5($callback);
        $this->bind($id, $gmEvent);
        $this->rules[] = $this->getInstance($id);

        return $this;
    }

    public function addEntry($entry): self
    {
        if (is_string($entry)) {
            $entry = new GmEntry($entry);
        }

        if (!$entry instanceof GmEntry) {
            throw new Exception('Unexpected entry provided as parameter (it must be either string or GmEntry)');
        }

        $id = $entry->getId() ?? 'entry_' . md5($entry);
        $this->unbind($id);

        $this->bind($id, $entry);
        $this->rules[] = $this->getInstance($id);

        return $this;
    }

    public array $rules = [];

    public function findOneRuleLoop($rule = null, array $visitedRules = [])
    {
        // Initialization
        if (!$rule) {
            foreach ($this->rules as $rule) {
                if ($loop = $this->findOneRuleLoop($rule)) {
                    return $loop;
                }
            }

            return null;
        }

        // Termination
        $parent = $rule->getParent();
        if (null == $parent) {
            return null;
        }

        // Parent not in rule list.. break here, but remember..
        // ..this might cause some issue (during execution).
        if (!in_array($parent, $this->rules)) {
            return null;
        }

        // Loop detected
        $visitedRules[] = $rule;
        if (in_array($parent, $visitedRules)) {
            $visitedRules[] = $parent;

            return $visitedRules;
        }

        return $this->findOneRuleLoop($parent, $visitedRules);
    }

    public function getAncestorHeight($rule)
    {
        if ($loop = $this->findOneRuleLoop()) {
            $loopStr = implode(' -> ', array_map(function ($rule) {
                return $rule->getId();
            }, $loop));
            throw new Exception('Cannot build from Google Map: one loop has been found (refers to the rule list): ' . $loopStr);
        }

        for ($i = 0; $parent = $rule->getParent(); ++$i) {
            if (in_array($parent, $this->rules)) {
                $rule = $parent;
            } else {
                return $i;
            }
        }

        return $i;
    }

    public function sortRules()
    {
        $rules = $this->rules;
        $ancestorHeight = array_map(
            function ($rule) {
                return $this->getAncestorHeight($rule);
            },
            $rules
        );

        $parentList = array_map(
            function ($rule) {
                return array_search(
                    ($parent = $rule->getParent()) ? $parent : $rule,
                    $this->rules
                );
            },
            $rules
        );

        array_multisort(
            $ancestorHeight,
            $parentList,
            array_keys($rules),
            $rules
        );

        return $rules;
    }

    public function build(): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $this->loadHtml2canvas();

        foreach ($this->rules as $object) {
            $object->buildListener($this);
        }

        foreach ($this->rules as $object) {
            $object->buildEntries($this);
        }

        $javascripts = '';
        foreach ($this->sortRules() as $object) {
            if ($object instanceof GmEntry) {
                $javascripts .= $object . PHP_EOL;
            } elseif ($object instanceof GmEvent) {
                $javascripts .= $object . PHP_EOL;
            } else {
                $isGranted = $this->isGranted();
                $cacheEnabled = $object->cacheEnabled();
                $cacheExists = $object->cacheExists() || $object->parentCacheExists();
                $cacheOnly = GmBuilder::getInstance()->cacheOnly;

                // Display Google API in the following cases
                $caseA = !$cacheEnabled;
                $caseB = !$cacheOnly && !$cacheExists;
                $caseC = $cacheOnly && $isGranted && !$cacheExists;

                if ($caseA || $caseB || $caseC) {
                    $javascripts .= 'var ' . $object->getId() . ' = ' . $object . ';' . PHP_EOL;
                }
            }
        }

        $javascripts = preg_replace("/^(?: )*\/\/.*\n/s", '', $javascripts);
        $javascripts = trim($javascripts);
        if (empty($javascripts)) {
            return false;
        }

        $this->loadApi();
        $this->initMap($javascripts);

        return true;
    }

    public function isGranted($subject = null): bool
    {
        if (null === $this->security->getToken()) {
            return false;
        }

        return $this->security->isGranted(GmBuilder::getInstance()->cacheControl, $subject);
    }

    public function reset()
    {
        $this->rules = [];

        foreach (GmBuilder::$_instanceId as $key => $instance) {
            unset(GmBuilder::$_instanceId[$key]);
        }
    }

    public function import(array $rules): bool
    {
        foreach ($rules as $rule) {
            if (!$rule instanceof GmObjectInterface) {
                throw new Exception('Unexpected entry rule found during importation');
            }

            $id = $rule->getId();

            $this->bind($id, $rule);
            $this->rules[] = $this->getInstance($id);
        }

        return true;
    }

    public function export(): array
    {
        return $this->rules;
    }

    public function getAsset(string $url): string
    {
        $url = trim($url);
        $parseUrl = parse_url($url);
        if ($parseUrl['scheme'] ?? false) {
            return $url;
        }

        $path = $parseUrl['path'];
        if (!str_starts_with($path, '/') && $this->requestStack->getCurrentRequest()) {
            $path = $this->requestStack->getCurrentRequest()->getBasePath() . '/' . $path;
        }

        return $path;
    }

    public function loadHtml2canvas()
    {
        if (!$this->enable) {
            return;
        }

        $javascripts = "<script src='" . $this->getAsset('/bundles/google/maps.js') . "'></script>" . PHP_EOL;
        $this->twig->addGlobal('google_maps', array_merge(
            $this->twig->getGlobals()['google_maps'] ?? [],
            ['html2canvas' => ($this->twig->getGlobals()['google_maps']['html2canvas'] ?? '') . $javascripts]
        ));
    }

    public function loadApi()
    {
        if (!$this->enable) {
            return;
        }

        $locale = $this->requestStack->getCurrentRequest()?->getLocale() ?? 'en';

        $javascripts = "<script src='https://polyfill.io/v3/polyfill.min.js?features=default'></script>" . PHP_EOL;
        $javascripts .= "<script src='https://maps.googleapis.com/maps/api/js?key=" . $this->keyClient . '&callback=' . $this->callback . '&libraries=' . $this->libraries . '&v=' . $this->version . '&language=' . $locale . "' defer async></script>";
        $this->twig->addGlobal('google_maps', array_merge(
            $this->twig->getGlobals()['google_maps'] ?? [],
            ['api' => ($this->twig->getGlobals()['google_maps']['api'] ?? '') . $javascripts]
        ));
    }

    public function initMap(string $initMapContent = '')
    {
        if (!$this->enable) {
            return;
        }

        $initMap = "<script type='text/javascript'>function " . GmBuilder::getInstance()->callback . '() { ' . PHP_EOL . $initMapContent . PHP_EOL . ' }</script>';
        $this->twig->addGlobal('google_maps', array_merge(
            $this->twig->getGlobals()['google_maps'] ?? [],
            ['initMap' => $initMap]
        ));
    }

    public function bind(string $id, GmObjectInterface $object): bool
    {
        if (empty($id)) {
            return false;
        } // Nothing to do

        if (array_key_exists($id, GmBuilder::$_instanceId) && GmBuilder::$_instanceId[$id] != $object) {
            throw new Exception('Instance ID "' . $id . '" already referenced in GmBuilder');
        }

        foreach (self::$_instanceId as $id0 => $object0) {
            if ($object0 == $object) {
                throw new Exception('Instance ID "' . $id . '" already referenced in GmBuilder as ' . $id0);
            }
        }

        self::$_instanceId[$id] = $object;
        $object->setId($id);

        return true;
    }

    public function unbind($objectId): bool
    {
        foreach (self::$_instanceId as $objectId0 => $object0) {
            if ($objectId0 == $objectId) {
                unset(self::$_instanceId[$objectId0]);
                $object0->setId('');

                return true;
            }
        }

        return false;
    }

    public function uploadCache(string $path, string $contents, array $config = []): ?string
    {
        try {
            GmBuilder::getInstance()->filesystem->write($path, $contents, $config);
        } catch (FilesystemError|UnableToWriteFile $exception) {
            throw new Exception("Unable to write file \"$path\" into cache..");

            return null;
        }

        return $path;
    }

    public function getCache(string $signature, array $opts = [])
    {
        try {
            $id = $opts['id'] ?? 0;

            $file = $this->getCachePath($signature, $id);
            $contents = GmBuilder::getInstance()->filesystem->read($file);

            $width = $opts['width'] ?? 0;
            $height = $opts['height'] ?? 0;
            if ($width || $height) {
                $image = imagecreatefromstring($contents);
                $imageCrop = $this->cropAlign($image, $width, $height);

                ob_start();
                switch (GmBuilder::getInstance()->cacheFormat) {
                    case 'jpeg':
                        imagejpeg($imageCrop);
                    // no break
                    default:
                        imagepng($imageCrop);
                }
                $contents = ob_get_clean();
                imagedestroy($image);
                imagedestroy($imageCrop);
            }

            return $contents;

        } catch (UnableToReadFile $exception) {

            throw new Exception("Unable to read file \"$signature\" from cache..");
            return null;
        }
    }

    public function getCachePath(string $signature, int $id = 0): string
    {
        if ($id < 0) {
            return $this->getCacheDirectory() . '/' . $signature . '/metadata.txt';
        }

        return $this->getCacheDirectory() . '/' . str_replace(['{signature}', '{id}'], [$signature, $id], $this->cachePublic) . '.' . $this->cacheFormat;
    }

    public function getCacheUrl($signature, $id = null): string
    {
        $url = (GmBuilder::getInstance()->router ? GmBuilder::getInstance()->router->generate('gm_show', ['signature' => $signature, 'id' => $id]) : null);
        if (!$url) {
            throw new Exception('"gm_show" route not properly configured..');
        }

        return $url;
    }

    public function setCacheMetadata(string $signature, array $array, array $config = []): ?string
    {
        $path = $this->getCacheDirectory() . '/' . $signature . '/metadata.txt';
        $contents = serialize($array);

        try {
            GmBuilder::getInstance()->filesystem->write($path, $contents, $config);
        } catch (UnableToWriteFile $exception) {
            throw new Exception("Unable to write metadata file \"$path\" into cache..");

            return null;
        }

        return $path;
    }

    public function getCacheMetadata($signature)
    {
        $file = $this->getCacheDirectory() . '/' . $signature . '/metadata.txt';
        if (!GmBuilder::getInstance()->filesystem->fileExists($file)) {
            return ['status' => GmBuilder::STATUS_BAD];
        }

        try {
            $contents = GmBuilder::getInstance()->filesystem->read($file);

            return unserialize($contents);
        } catch (UnableToReadFile $exception) {
            throw new Exception("Unable to read metadata file \"$file\" from cache..");
            // return ["status" => GmBuilder::STATUS_BAD];
        }
    }

    public function cacheExists(string $signature, ?array $opts = [])
    {
        try {
            $id = $opts['id'] ?? -1;

            if ($id < 0) {
                $path = $this->getCacheDirectory() . '/' . $signature . '/metadata.txt';
            } else {
                $path = $this->getCachePath($signature, $id);
            }

            return GmBuilder::getInstance()->filesystem->fileExists($path);
            
        } catch (UnableToRetrieveMetadata $exception) {

            throw new Exception("Unable to retrieve file \"$signature\" from cache..");
            return null;
        }
    }

    public function deleteCache(string $signature)
    {
        try {

            $path = $this->getCacheDirectory() . '/' . $signature . '/';
            GmBuilder::getInstance()->filesystem->deleteDirectory($path);

            return true;

        } catch (UnableToDeleteFile $exception) {
            throw new Exception("Unable to delete file \"$signature\" from cache..");
        }
    }

    public function cropAlign($image, $cropWidth, $cropHeight, $horizontalAlign = 'center', $verticalAlign = 'middle')
    {
        $width = imagesx($image);
        $height = imagesy($image);

        if (0 == $cropWidth) {
            $cropWidth = $width;
        }
        if (0 == $cropHeight) {
            $cropHeight = $height;
        }

        $horizontalAlignPixels = $this->calculatePixelsForAlign($width, $cropWidth, $horizontalAlign);
        $verticalAlignPixels = $this->calculatePixelsForAlign($height, $cropHeight, $verticalAlign);

        return imagecrop($image, [
            'x' => $horizontalAlignPixels[0],
            'y' => $verticalAlignPixels[0],
            'width' => $horizontalAlignPixels[1],
            'height' => $verticalAlignPixels[1],
        ]);
    }

    public function calculatePixelsForAlign($imageSize, $cropSize, $align)
    {
        return match ($align) {
            'left', 'top' => [0, min($cropSize, $imageSize)],
            'right', 'bottom' => [max(0, $imageSize - $cropSize), min($cropSize, $imageSize)],
            'center', 'middle' => [
                max(0, floor(($imageSize / 2) - ($cropSize / 2))),
                min($cropSize, $imageSize),
            ],
            default => [0, $imageSize],
        };
    }

    public function addMap(string $id, $map): self
    {
        if (!($map instanceof MapStatic ||
            $map instanceof MapUrl ||
            $map instanceof MapEmbed ||
            $map instanceof Map)) {
            throw new Exception('Map parameter received is "' . get_class($map) . '" expected: "MapStatic, MapUrl, MapEmbed, Map"');
        }

        $this->bind($id, $map);
        $this->rules[] = $this->getInstance($id);

        return $this;
    }

    public function addPlace(string $id, $opts = []): self
    {
        $place = ($opts instanceof Place ? $opts : new Place(null, $opts));

        $this->bind($id, $place);
        $this->rules[] = $this->getInstance($id);

        return $this;
    }

    public function addMarker(string $id, Marker $marker): self
    {
        $this->bind($id, $marker);
        $this->rules[] = $this->getInstance($id);

        return $this;
    }

    public function addMapStyle(string $id, MapTypeStyle $mapStyle): self
    {
        $this->bind($id, $mapStyle);
        $this->rules[] = $this->getInstance($id);

        return $this;
    }

    public function addLatLng(string $id, LatLng $latLng): self
    {
        $this->bind($id, $latLng);
        $this->rules[] = $this->getInstance($id);

        return $this;
    }
}
