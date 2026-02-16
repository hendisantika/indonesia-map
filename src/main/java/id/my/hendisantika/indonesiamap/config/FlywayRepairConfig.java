package id.my.hendisantika.indonesiamap.config;

import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy repairBeforeMigrate() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
