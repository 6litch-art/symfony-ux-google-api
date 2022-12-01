<?php

namespace Google\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Config\Definition\Exception\Exception;
use Google\Builder\GmBuilder;
use Google\Builder\GmBuilderInterface;
use Google\Model\Places\Place;
use Google\Model\Maps\Map;
use Google\Model\Maps\Overlay\Marker;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class GmController extends AbstractController
{
    private $gmBuilder;
    public function __construct(GmBuilderInterface $gmBuilder) {
        $this->gmBuilder = $gmBuilder;
    }

    /**
     * Controller example
     * @Route("/", name="gm")
     */
    public function Main(): Response
    {
        if (!$this->gmBuilder->alreadyExists("myMap"))
        {
            $sidney  = new Place("ChIJN1t_tDeuEmsRUsoyG83frY4");
            $url = "https://maps.googleapis.com/maps/api/staticmap?center=40.714%2c%20-73.998&zoom=12&size=400x400&key=AIzaSyDtqB9Vqs9nj2Yu5sQLMyqwK9pGWEbSltA";

            $myMarker = new Marker([
                "map" => "myMap",
                "position" => $sidney->getLatLng(),
                "title" => "\"Sidney !\""
            ]);

            $myMap = new Map([
                "zoom" => 8,
                "center" => $sidney->getLatLng(),
                "html2canvas" => True
            ]);

            $myMap->setDefaultUI(0);
            $myMarker->setParent($myMap);

            $this->gmBuilder
                ->addMap("myMap", $myMap)
                ->addMarker("myMarker", $myMarker)
                ->addListener("myMap", "click",
                "function placeMarker(location) {

                    console.log(location);
                    if (myMarker != null) myMarker.setPosition(location.latLng);
                    else {

                        myMarker = new google.maps.Marker({
                            position: location,
                            map: myMap
                        });
                    }
                }")
            ->build();
        }

        return $this->render("@Gm/index.html.twig");
    }


    /**
     * Display cache image
     * @Route("/{signature}", name="gm_show_metadata")
     */
    public function ShowMetadata(string $signature)
    {
        $metadata = $this->gmBuilder->getCacheMetadata($signature);
        return JsonResponse::fromJsonString(json_encode($metadata));
    }

    /**
     * Export using html2canvas
     * @Route("/{signature}/export", name="gm_export")
     */
    public function Export(string $signature, Request $request)
    {
        if (!$this->gmBuilder->isGranted())
            throw new AccessDeniedException('Access denied.');

        $submittedToken = $request->request->get('gm_csrf_token');
        if (!$this->isCsrfTokenValid('html2canvas-export', $submittedToken))
            throw new Exception("Invalid CSRF token.");

        $data = $request->request->get('gm_base64data') ?? null;
        if(!$data) throw new Exception("No base64 data provided");

        $tilesize = $request->request->get('gm_tilesize') ?? null;
        if(!$tilesize) {

            list($width, $height) = getimagesizefromstring(base64_decode(explode('base64,', $data)[1]));
            $nx = 1; $ny = 1;

            // Upload picture
            $this->gmBuilder->uploadCache(
                $this->gmBuilder->getCachePath($signature),
                base64_decode(explode('base64,', $data)[1])
            );

        } else {

            // Subdivide picture
            $im = imagecreatefromstring(base64_decode(explode('base64,', $data)[1]));
            if ($im === false) throw new Exception("Failed to compute a valid image from base64 input");

            $width = imagesx($im);
            $height = imagesy($im);
            $nx = ceil($width  / $tilesize);
            $ny = ceil($height / $tilesize);

            for ($iy = 0; $iy < $ny; $iy++) {
                for ($ix = 0; $ix < $nx; $ix++) {

                    $tileindex  = $iy*$nx + $ix;
                    $tilewidth  = ($ix == $nx - 1 ? $width  - $ix * $tilesize : $tilesize);
                    $tileheight = ($iy == $ny - 1 ? $height - $iy * $tilesize : $tilesize);

                    // Crop image and keep its transparency
                    $imcrop = imagecreatetruecolor($tilesize, $tilesize);
                    $transparentColor = imagecolorallocatealpha($imcrop, 0, 0, 0, 127);
                    imagefill($imcrop, 0, 0, $transparentColor);
                    imagealphablending($imcrop, false);
                    imagesavealpha($imcrop, true);
                    imagecopyresampled(
                        $imcrop, $im,
                        0, 0, $tilesize*$ix, $tilesize*$iy,
                        $tilewidth, $tileheight, $tilewidth, $tileheight
                    );

                    ob_start(); // Let's start output buffering.
                    switch ($this->gmBuilder->cacheFormat) {
                        case "jpeg":
                        case "jpg":
                            imagejpeg($imcrop);
                            break;

                        default:
                        case "png":
                            imagepng($imcrop);
                            break;
                    }
                    $contents = ob_get_contents(); //Instead, output above is saved to $contents
                    ob_end_clean(); //End the output buffer.

                    // Upload tiled pictures
                    $this->gmBuilder->uploadCache(
                        $this->gmBuilder->getCachePath($signature, $tileindex),
                        $contents
                    );

                }
            }
        }

        $array["status"] = GmBuilder::STATUS_OK;
        $array["image_width"]  = $width;
        $array["image_height"] = $height;

        $array["image_tilesize"] = $tilesize;
        $array["image_xtiles"] = $nx;
        $array["image_ytiles"] = $ny;
        $this->gmBuilder->setCacheMetadata($signature, $array);

        return $this->ShowMetadata($signature);
    }

    /**
     * Suppress a cache image
     * @Route("/{signature}/suppress", name="gm_suppress")
     * */
    public function Suppress(string $signature)
    {
        if (!$this->gmBuilder->isGranted())
            throw new AccessDeniedException('Access denied.');

        if($this->gmBuilder->deleteCache($signature))
            return JsonResponse::fromJsonString(json_encode(["status" => GmBuilder::STATUS_OK]));

        return JsonResponse::fromJsonString(json_encode(["status" => GmBuilder::STATUS_BAD]));
    }

    /**
     * Display cache image
     * @Route("/{signature}/{tile}", name="gm_show")
     */
    public function Show(string $signature, int $tile = 0)
    {
        if ($this->gmBuilder->cacheExists($signature, ["tile" => $tile])) {

            $response = new Response();
            $response->setContent($this->gmBuilder->getCache($signature, ["tile" => $tile]));

            $response->setPublic();
            $response->setMaxAge($this->gmBuilder->cacheLifetime);

            $response->headers->addCacheControlDirective('must-revalidate', true);
            $response->headers->set('Content-Type', 'image/' . $this->gmBuilder->cacheFormat);

            $response->setEtag(md5($response->getContent()));

            return $response;
        }

        $file = $this->gmBuilder->getPublicDirectory() . "/no-image.png";
        return new BinaryFileResponse($file);
    }
}
