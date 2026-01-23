package id.my.hendisantika.indonesiamap.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Created by IntelliJ IDEA.
 * Project : indonesia-map
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 23/01/26
 * Time: 08.00
 * To change this template use File | Settings | File Templates.
 */
@Entity
@Table(name = "wilayah_level_1_2")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WilayahLevel12 {

    @Id
    @Column(length = 13)
    private String kode;

    @Column(length = 100)
    private String nama;

    @Column(length = 100)
    private String ibukota;

    @Column(columnDefinition = "DOUBLE")
    private Double lat;

    @Column(columnDefinition = "DOUBLE")
    private Double lng;

    @Column(nullable = false, columnDefinition = "FLOAT DEFAULT 0")
    private Float elv;

    @Column(columnDefinition = "TINYINT(4)")
    private Integer tz;

    @Column(columnDefinition = "DOUBLE")
    private Double luas;

    @Column(columnDefinition = "DOUBLE")
    private Double penduduk;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String path;

    @Column(columnDefinition = "TINYINT(4)")
    private Integer status;

    @Transient
    public String getLevel() {
        if (kode == null) return "";
        return switch (kode.length()) {
            case 2 -> "Provinsi";
            case 5 -> "Kabupaten/Kota";
            case 8 -> "Kecamatan";
            case 13 -> "Desa/Kelurahan";
            default -> "Unknown";
        };
    }
}
