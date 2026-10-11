
package com.expensetracker.backend;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private LocalDate date;

    // Required by JPA
    protected Transaction() {
    }

    public Transaction(
            BigDecimal amount,
            TransactionType type,
            String category,
            String description,
            LocalDate date) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.description = description;
        this.date = date;
    }

    
public void setAmount(BigDecimal amount) {
    this.amount = amount;
}

public void setType(TransactionType type) {
    this.type = type;
}

public void setCategory(String category) {
    this.category = category;
}

public void setDescription(String description) {
    this.description = description;
}

public void setDate(LocalDate date) {
    this.date = date;
}


    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getDate() {
        return date;
    }
}
