package id.my.hendisantika.indonesiamap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import id.my.hendisantika.indonesiamap.entity.BoundaryData;
import id.my.hendisantika.indonesiamap.entity.WilayahLevel12;
import id.my.hendisantika.indonesiamap.repository.WilayahRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Created by IntelliJ IDEA.
 * Project : indonesia-map
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 23/01/26
 * Time: 08.02
 * To change this template use File | Settings | File Templates.
 */
@Service
@RequiredArgsConstructor
public class WilayahService {

    private final WilayahRepository wilayahRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<WilayahLevel12> getAllProvinsi() {
        return wilayahRepository.findAllProvinsi();
    }

    public List<WilayahLevel12> getKabupatenByProvinsi(String provinsiKode) {
        return wilayahRepository.findKabupatenByProvinsi(provinsiKode);
    }

    public List<WilayahLevel12> getKecamatanByKabupaten(String kabupatenKode) {
        return wilayahRepository.findKecamatanByKabupaten(kabupatenKode);
    }

    public List<WilayahLevel12> getDesaByKecamatan(String kecamatanKode) {
        return wilayahRepository.findDesaByKecamatan(kecamatanKode);
    }

    public Optional<WilayahLevel12> getByKode(String kode) {
        if (kode == null) {
            return Optional.empty();
        }

        // Remove dots to count the actual digits
        String kodeWithoutDots = kode.replace(".", "");
        int length = kodeWithoutDots.length();

        // Provinsi (2 digits) or Kabupaten (5 digits)
        if (length <= 5) {
            return wilayahRepository.findById(kode);
        }
        // Kecamatan (8 digits)
        else if (length <= 8) {
            return wilayahRepository.findKecamatanByKode(kode);
        }
        // Desa/Kelurahan (13 digits)
        else {
            return wilayahRepository.findDesaByKode(kode);
        }
    }

    public List<WilayahLevel12> search(String keyword) {
        return wilayahRepository.searchByNama(keyword);
    }

    public List<WilayahLevel12> getAll() {
        return wilayahRepository.findAll();
    }

    public Optional<BoundaryData> getBoundaryData(String kode) {
        if (kode == null) {
            return Optional.empty();
        }

        String kodeWithoutDots = kode.replace(".", "");
        int length = kodeWithoutDots.length();

        try {
            // All levels now use the same approach - path field contains JSON coordinate arrays
            Optional<WilayahLevel12> wilayah;

            if (length <= 5) {
                // Provinsi (2 digits) or Kabupaten (5 digits)
                wilayah = wilayahRepository.findById(kode);
            } else if (length <= 8) {
                // Kecamatan (8 digits)
                wilayah = wilayahRepository.findKecamatanByKode(kode);
            } else {
                // Desa/Kelurahan (13+ digits)
                wilayah = wilayahRepository.findDesaByKode(kode);
            }

            return wilayah.map(w -> {
                BoundaryData bd = new BoundaryData();
                bd.setKode(w.getKode());
                bd.setNama(w.getNama());
                bd.setLevel(w.getLevel());
                bd.setLat(w.getLat());
                bd.setLng(w.getLng());
                bd.setCoordinates(w.getPath()); // Already in coordinate array format
                return bd;
            });
        } catch (Exception e) {
            e.printStackTrace();
        }

        return Optional.empty();
    }
}
