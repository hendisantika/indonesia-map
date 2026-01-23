package id.my.hendisantika.indonesiamap.entity;

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
 * Time: 22.15
 * To change this template use File | Settings | File Templates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoundaryData {
    private String kode;
    private String nama;
    private String level;
    private Double lat;
    private Double lng;
    private String coordinates; // GeoJSON coordinates
}
