<?php

namespace Google\Controller;

use Google\Builder\GmBuilder;
use Google\Builder\GmBuilderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Config\Definition\Exception\Exception;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 *
 */
class GmController extends AbstractController
{
    protected GmBuilderInterface $gmBuilder;

    public function __construct(GmBuilderInterface $gmBuilder)
    {
        $this->gmBuilder = $gmBuilder;
    }

    /**
     * Display cache image.
     */

    #[Route("/google/maps/{signature}", name:"gm_show_metadata")]
    public function ShowMetadata(string $signature)
    {
        $metadata = $this->gmBuilder->getCacheMetadata($signature);

        return JsonResponse::fromJsonString(json_encode($metadata));
    }

    /**
     * Export using html2canvas.
     */

    #[Route("/google/maps/{signature}/export", name:"gm_export")]
    public function Export(string $signature, Request $request)
    {
        if (!$this->gmBuilder->isGranted()) {
            throw new AccessDeniedException('Access denied.');
        }

        $submittedToken = $request->request->get('gm_csrf_token');
        if (!$this->isCsrfTokenValid('html2canvas-export', $submittedToken)) {
            throw new Exception('Invalid CSRF token.');
        }

        $data = $request->request->get('gm_base64data') ?? null;
        if (!$data) {
            throw new Exception('No base64 data provided');
        }

        $tilesize = $request->request->get('gm_tilesize') ?? null;
        if (!$tilesize) {

            list($width, $height) = getimagesizefromstring(base64_decode(explode('base64,', $data)[1]));
            $nx = 1;
            $ny = 1;

            // Upload picture
            $this->gmBuilder->uploadCache(
                $this->gmBuilder->getCachePath($signature),
                base64_decode(explode('base64,', $data)[1])
            );

        } else {

            // Subdivide picture
            $im = imagecreatefromstring(base64_decode(explode('base64,', $data)[1]));
            if (false === $im) {
                throw new Exception('Failed to compute a valid image from base64 input');
            }

            $width = imagesx($im);
            $height = imagesy($im);
            $nx = ceil($width / $tilesize);
            $ny = ceil($height / $tilesize);

            for ($iy = 0; $iy < $ny; ++$iy) {
                for ($ix = 0; $ix < $nx; ++$ix) {
                    $tileindex = $iy * $nx + $ix;
                    $tilewidth = ($ix == $nx - 1 ? $width - $ix * $tilesize : $tilesize);
                    $tileheight = ($iy == $ny - 1 ? $height - $iy * $tilesize : $tilesize);

                    // Crop image and keep its transparency
                    $imcrop = imagecreatetruecolor($tilesize, $tilesize);
                    $transparentColor = imagecolorallocatealpha($imcrop, 0, 0, 0, 127);
                    imagefill($imcrop, 0, 0, $transparentColor);
                    imagealphablending($imcrop, false);
                    imagesavealpha($imcrop, true);
                    imagecopyresampled(
                        $imcrop, $im,
                        0, 0, $tilesize * $ix, $tilesize * $iy,
                        $tilewidth, $tileheight, $tilewidth, $tileheight
                    );

                    ob_start(); // Let's start output buffering.
                    switch ($this->gmBuilder->cacheFormat) {
                        case 'jpeg':
                        case 'jpg':
                            imagejpeg($imcrop);
                            break;

                        default:
                        case 'png':
                            imagepng($imcrop);
                            break;
                    }
                    $contents = ob_get_contents(); // Instead, output above is saved to $contents
                    ob_end_clean(); // End the output buffer.

                    // Upload tiled pictures
                    $this->gmBuilder->uploadCache(
                        $this->gmBuilder->getCachePath($signature, $tileindex),
                        $contents
                    );
                }
            }
        }

        $array['status'] = GmBuilder::STATUS_OK;
        $array['image_width'] = $width;
        $array['image_height'] = $height;

        $array['image_tilesize'] = $tilesize;
        $array['image_xtiles'] = $nx;
        $array['image_ytiles'] = $ny;
        $this->gmBuilder->setCacheMetadata($signature, $array);

        return $this->ShowMetadata($signature);
    }

    /**
     * Suppress a cache image.
     */
    
    #[Route("/google/maps/{signature}/suppress", name:"gm_suppress")]
    public function Suppress(string $signature)
    {
        if (!$this->gmBuilder->isGranted()) {
            throw new AccessDeniedException('Access denied.');
        }

        if ($this->gmBuilder->deleteCache($signature)) {
            return JsonResponse::fromJsonString(json_encode(['status' => GmBuilder::STATUS_OK]));
        }

        return JsonResponse::fromJsonString(json_encode(['status' => GmBuilder::STATUS_BAD]));
    }

    /**
     * Display cache image.
     */

    #[Route("/google/maps/{signature}/{id}", name:"gm_show")]
    public function Show(string $signature, int $id = 0): Response
    {
        if ($this->gmBuilder->cacheExists($signature, ['id' => $id])) {
            $response = new Response();
            $response->setContent($this->gmBuilder->getCache($signature, ['id' => $id]));

            $response->setPublic();
            $response->setMaxAge($this->gmBuilder->cacheLifetime);

            $response->headers->addCacheControlDirective('must-revalidate');
            $response->headers->set('Content-Type', 'image/' . $this->gmBuilder->cacheFormat);

            $response->setEtag(md5($response->getContent()));

            return $response;
        }

        $file = $this->gmBuilder->getPublicDirectory() . '/no-image.png';

        return new BinaryFileResponse($file);
    }
}
