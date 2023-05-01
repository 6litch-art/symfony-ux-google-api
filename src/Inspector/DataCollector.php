<?php

namespace Google\Inspector;

use Base\Service\ParameterBagInterface;

use Composer\InstalledVersions;
use Google\GtmBundle;
use ReflectionClass;
use Symfony\Bundle\FrameworkBundle\DataCollector\AbstractDataCollector;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DataCollector extends AbstractDataCollector
{
    /**
     * @var ParameterBagInterface
     */
    protected ParameterBagInterface $parameterBag;

    public array $dataBundles = [];

    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->parameterBag = $parameterBag;
    }

    public function getName(): string
    {
        return 'gtm';
    }

    public static function getTemplate(): ?string
    {
        return '@Google/inspector/data_collector.html.twig';
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function getDataBundle(string $bundle): ?array
    {
        if (!array_key_exists($bundle, $this->dataBundles)) {
            $this->collectDataBundle($bundle);
        }

        return $this->dataBundles[$bundle] ?? null;
    }

    public function getMethod()
    {
        return $this->data['method'];
    }

    public function collectDataBundle(string $bundle, ?string $bundleSuffix = null)
    {
        $bundleIdentifier = $this->getBundleIdentifier($bundle);
        if (!$bundleIdentifier) {
            return false;
        }

        $bundleLocation = InstalledVersions::getRootPackage()["install_path"];
        $bundleLocation = realpath($bundleLocation . "vendor/" . $bundleIdentifier);

        $bundleVersion = InstalledVersions::getPrettyVersion($bundleIdentifier);
        $bundleDevRequirements = !InstalledVersions::isInstalled($bundleIdentifier, false);
        $bundleSuffix = $bundleSuffix ? "@" . $bundleSuffix : "";

        $this->dataBundles[$bundle] = [
            "identifier" => $bundleIdentifier,
            "name" => "Google Tag Manager Bundle",
            "location" => $bundleLocation,
            "version" => str_lstrip($bundleVersion, "v") . $bundleSuffix,
            "dev_requirements" => $bundleDevRequirements
        ];

        return true;
    }

    public function collect(Request $request, Response $response, $exception = null)
    {
        $this->collectDataBundle(GtmBundle::class);

        $this->data = array_map_recursive(fn($v) => $this->cloneVar($v), $this->collectData());
        $this->data["_bundles"] = $this->dataBundles;
    }

    protected function getBundleIdentifier(string $bundle)
    {
        if (!class_exists($bundle)) {
            return null;
        }

        if (array_key_exists($bundle, $this->dataBundles)) {
            return $this->dataBundles[$bundle]["identifier"];
        }

        $reflector = new ReflectionClass($bundle);
        $bundleRoot = dirname($reflector->getFileName());

        foreach (InstalledVersions::getInstalledPackages() as $bundleIdentifier) {
            $bundleLocation = InstalledVersions::getRootPackage()["install_path"];
            $bundleLocation = realpath($bundleLocation . "vendor/" . $bundleIdentifier);

            if ($bundleLocation && str_starts_with($bundleRoot, $bundleLocation)) {
                return $bundleIdentifier;
            }
        }

        return null;
    }

    private function getBundleFormattedName(string $bundle)
    {
        $bundleName = $this->getDataBundle($bundle)["name"] ?? null;
        $bundleVersion = $this->getDataBundle($bundle)["version"] ?? null;
        $bundleVersion = ($bundleVersion ? " (" . $bundleVersion . ")" : "");
        return $bundleName . $bundleVersion;
    }

    private function collectData(): array
    {
        $defaultContainer = $this->parameterBag->get("google.tag_manager.containers.default");

        $data = [];
        $data[$this->getBundleFormattedName(GtmBundle::class)] = [
            'Server' => $defaultContainer["url"] ?? "n/a",
            'Container' => $defaultContainer["id"] ?? "n/a"
        ];

        return $data;
    }
}
