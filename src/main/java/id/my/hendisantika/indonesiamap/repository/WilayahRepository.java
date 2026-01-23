package id.my.hendisantika.indonesiamap.repository;

import id.my.hendisantika.indonesiamap.entity.WilayahLevel12;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Created by IntelliJ IDEA.
 * Project : indonesia-map
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 23/01/26
 * Time: 08.01
 * To change this template use File | Settings | File Templates.
 */
@Repository
public interface WilayahRepository extends JpaRepository<WilayahLevel12, String> {

    @Query("SELECT w FROM WilayahLevel12 w WHERE LENGTH(w.kode) = 2 ORDER BY w.nama")
    List<WilayahLevel12> findAllProvinsi();

    @Query("SELECT w FROM WilayahLevel12 w WHERE w.kode LIKE CONCAT(:provinsiKode, '%') AND LENGTH(w.kode) = 5 ORDER BY w.nama")
    List<WilayahLevel12> findKabupatenByProvinsi(@Param("provinsiKode") String provinsiKode);

    @Query(value = "SELECT kode, nama, NULL as ibukota, lat, lng, 0 as elv, NULL as tz, NULL as luas, NULL as penduduk, path, NULL as status " +
            "FROM wilayah_level_3_4 " +
            "WHERE parent_kode = :kabupatenKode AND level = 3 " +
            "ORDER BY nama", nativeQuery = true)
    List<WilayahLevel12> findKecamatanByKabupaten(@Param("kabupatenKode") String kabupatenKode);

    @Query(value = "SELECT kode, nama, NULL as ibukota, lat, lng, 0 as elv, NULL as tz, NULL as luas, NULL as penduduk, path, NULL as status " +
            "FROM wilayah_level_3_4 " +
            "WHERE parent_kode = :kecamatanKode AND level = 4 " +
            "ORDER BY nama LIMIT 1000", nativeQuery = true)
    List<WilayahLevel12> findDesaByKecamatan(@Param("kecamatanKode") String kecamatanKode);

    @Query("SELECT w FROM WilayahLevel12 w WHERE w.nama LIKE %:keyword% ORDER BY w.nama")
    List<WilayahLevel12> searchByNama(@Param("keyword") String keyword);

    @Query(value = "SELECT kode, nama, NULL as ibukota, lat, lng, 0 as elv, NULL as tz, NULL as luas, NULL as penduduk, path, NULL as status " +
            "FROM wilayah_level_3_4 " +
            "WHERE kode = :kode AND level = 3 " +
            "LIMIT 1", nativeQuery = true)
    Optional<WilayahLevel12> findKecamatanByKode(@Param("kode") String kode);

    @Query(value = "SELECT kode, nama, NULL as ibukota, lat, lng, 0 as elv, NULL as tz, NULL as luas, NULL as penduduk, path, NULL as status " +
            "FROM wilayah_level_3_4 " +
            "WHERE kode = :kode AND level = 4 " +
            "LIMIT 1", nativeQuery = true)
    Optional<WilayahLevel12> findDesaByKode(@Param("kode") String kode);
}
