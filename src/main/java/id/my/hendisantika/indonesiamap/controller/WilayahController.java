package id.my.hendisantika.indonesiamap.controller;

import id.my.hendisantika.indonesiamap.entity.BoundaryData;
import id.my.hendisantika.indonesiamap.entity.WilayahLevel12;
import id.my.hendisantika.indonesiamap.service.WilayahService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * Project : indonesia-map
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 23/01/26
 * Time: 08.04
 * To change this template use File | Settings | File Templates.
 */
@Controller
@RequestMapping("/wilayah")
@RequiredArgsConstructor
public class WilayahController {

    private final WilayahService wilayahService;

    @GetMapping("/provinsi")
    public String getProvinsiList(Model model) {
        model.addAttribute("wilayahList", wilayahService.getAllProvinsi());
        return "fragments/wilayah-list :: wilayah-list";
    }

    @GetMapping("/kabupaten/{provinsiKode}")
    public String getKabupatenList(@PathVariable String provinsiKode, Model model) {
        model.addAttribute("wilayahList", wilayahService.getKabupatenByProvinsi(provinsiKode));
        return "fragments/wilayah-list :: wilayah-list";
    }

    @GetMapping("/kecamatan/{kabupatenKode}")
    public String getKecamatanList(@PathVariable String kabupatenKode, Model model) {
        model.addAttribute("wilayahList", wilayahService.getKecamatanByKabupaten(kabupatenKode));
        return "fragments/wilayah-list :: wilayah-list";
    }

    @GetMapping("/desa/{kecamatanKode}")
    public String getDesaList(@PathVariable String kecamatanKode, Model model) {
        model.addAttribute("wilayahList", wilayahService.getDesaByKecamatan(kecamatanKode));
        return "fragments/wilayah-list :: wilayah-list";
    }

    @GetMapping("/search")
    public String search(@RequestParam String keyword, Model model) {
        model.addAttribute("wilayahList", wilayahService.search(keyword));
        return "fragments/wilayah-list :: wilayah-list";
    }

    @GetMapping("/detail/{kode}")
    public String getDetail(@PathVariable String kode, Model model) {
        wilayahService.getByKode(kode).ifPresent(wilayah ->
                model.addAttribute("wilayah", wilayah));
        return "fragments/wilayah-detail :: wilayah-detail";
    }

    @GetMapping("/api/boundaries/{kode}")
    @ResponseBody
    public ResponseEntity<WilayahLevel12> getBoundaries(@PathVariable String kode) {
        return wilayahService.getByKode(kode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/all")
    @ResponseBody
    public ResponseEntity<List<WilayahLevel12>> getAllWithBoundaries() {
        return ResponseEntity.ok(wilayahService.getAll());
    }

    @GetMapping("/kabupaten-select/{provinsiKode}")
    public String getKabupatenSelect(@PathVariable String provinsiKode, Model model) {
        model.addAttribute("kabupatenList", wilayahService.getKabupatenByProvinsi(provinsiKode));
        return "fragments/kabupaten-select :: kabupaten-select";
    }

    @GetMapping("/kecamatan-select/{kabupatenKode}")
    public String getKecamatanSelect(@PathVariable String kabupatenKode, Model model) {
        model.addAttribute("kecamatanList", wilayahService.getKecamatanByKabupaten(kabupatenKode));
        return "fragments/kecamatan-select :: kecamatan-select";
    }

    @GetMapping("/desa-select/{kecamatanKode}")
    public String getDesaSelect(@PathVariable String kecamatanKode, Model model) {
        model.addAttribute("desaList", wilayahService.getDesaByKecamatan(kecamatanKode));
        return "fragments/desa-select :: desa-select";
    }

    @GetMapping("/api/boundary/{kode}")
    @ResponseBody
    public ResponseEntity<BoundaryData> getBoundaryWithGeometry(@PathVariable String kode) {
        return wilayahService.getBoundaryData(kode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
