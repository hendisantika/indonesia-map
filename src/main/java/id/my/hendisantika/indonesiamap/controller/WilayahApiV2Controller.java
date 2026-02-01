package id.my.hendisantika.indonesiamap.controller;

import id.my.hendisantika.indonesiamap.entity.BoundaryData;
import id.my.hendisantika.indonesiamap.entity.WilayahLevel12;
import id.my.hendisantika.indonesiamap.service.WilayahService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * Project : indonesia-map
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 02/02/26
 * Time: 05.25
 * To change this template use File | Settings | File Templates.
 */
@RestController
@RequestMapping("/api/v2/wilayah")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WilayahApiV2Controller {

    private final WilayahService wilayahService;

    /**
     * Get all provinces (provinsi)
     * @return List of all provinces
     */
    @GetMapping("/provinsi")
    public ResponseEntity<List<WilayahLevel12>> getAllProvinsi() {
        return ResponseEntity.ok(wilayahService.getAllProvinsi());
    }

    /**
     * Get all kabupaten by province code
     * @param provinsiKode Province code
     * @return List of kabupaten in the province
     */
    @GetMapping("/provinsi/{provinsiKode}/kabupaten")
    public ResponseEntity<List<WilayahLevel12>> getKabupatenByProvinsi(@PathVariable String provinsiKode) {
        return ResponseEntity.ok(wilayahService.getKabupatenByProvinsi(provinsiKode));
    }

    /**
     * Get all kecamatan by kabupaten code
     * @param kabupatenKode Kabupaten code
     * @return List of kecamatan in the kabupaten
     */
    @GetMapping("/kabupaten/{kabupatenKode}/kecamatan")
    public ResponseEntity<List<WilayahLevel12>> getKecamatanByKabupaten(@PathVariable String kabupatenKode) {
        return ResponseEntity.ok(wilayahService.getKecamatanByKabupaten(kabupatenKode));
    }

    /**
     * Get all desa by kecamatan code
     * @param kecamatanKode Kecamatan code
     * @return List of desa in the kecamatan
     */
    @GetMapping("/kecamatan/{kecamatanKode}/desa")
    public ResponseEntity<List<WilayahLevel12>> getDesaByKecamatan(@PathVariable String kecamatanKode) {
        return ResponseEntity.ok(wilayahService.getDesaByKecamatan(kecamatanKode));
    }

    /**
     * Search wilayah by keyword
     * @param keyword Search keyword
     * @return List of matching wilayah
     */
    @GetMapping("/search")
    public ResponseEntity<List<WilayahLevel12>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(wilayahService.search(keyword));
    }

    /**
     * Get wilayah detail by code
     * @param kode Wilayah code
     * @return Wilayah detail
     */
    @GetMapping("/{kode}")
    public ResponseEntity<WilayahLevel12> getByKode(@PathVariable String kode) {
        return wilayahService.getByKode(kode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get wilayah with boundaries by code
     * @param kode Wilayah code
     * @return Wilayah with boundaries
     */
    @GetMapping("/{kode}/boundaries")
    public ResponseEntity<WilayahLevel12> getBoundaries(@PathVariable String kode) {
        return wilayahService.getByKode(kode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all wilayah with boundaries
     * @return List of all wilayah with boundaries
     */
    @GetMapping("/all")
    public ResponseEntity<List<WilayahLevel12>> getAllWithBoundaries() {
        return ResponseEntity.ok(wilayahService.getAll());
    }

    /**
     * Get boundary data with geometry by code
     * @param kode Wilayah code
     * @return Boundary data with geometry
     */
    @GetMapping("/{kode}/boundary")
    public ResponseEntity<BoundaryData> getBoundaryWithGeometry(@PathVariable String kode) {
        return wilayahService.getBoundaryData(kode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
