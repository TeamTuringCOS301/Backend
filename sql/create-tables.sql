--------------------------------------------------------------------
-- Project:	ERP-Coin
-- Version Number:	1.0.0 / 2018

-- Company:	EPI-USE

-- Author/s:       Kyle Pretorius
--                 Ulrik de Muelenaere
--                 Tristan Rothman
--                 Sewis van Wyk
--                 Richard Dixie
--                 Darius Scheepers

-- SQL version: MySQL

-- Purpose Statement: Create the whole bulk of the database structure, without
-- any data.
--------------------------------------------------------------------

-- Database Administrater: Darius Scheepers

-- Naming conventions:
--    object names have a prefix that is one of following acronyms followed by
--    the object's identifier
-- Acronyms:
-- db = database
-- tbl = table
-- adm = admin user
-- con = conservation area
-- hnc = hotspot node coordinate
-- usr = user
-- ale = alert
-- veh = vehicle
-- cup = conservation area user points

-- MySQL Script generated by MySQL Workbench
-- Mon 07 May 2018 11:12:18 SAST
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema dbERPCOIN
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `dbERPCOIN` DEFAULT CHARACTER SET latin1 ;
USE `dbERPCOIN` ;

-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblAdminUser`
-- -----------------------------------------------------
-- Description: Stores basic information of an administrator.
-- admSuperAdmin: flag to indicate this is a super user.
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblAdminUser` (
  `admID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `admUsername` VARCHAR(50) NOT NULL,
  `admEmailAddress` VARCHAR(100) NOT NULL,
  `admPassword` VARCHAR(60) NOT NULL,
  `admName` VARCHAR(40) NOT NULL,
  `admSurname` VARCHAR(40) NOT NULL,
  `admSuperAdmin` BIT(1) NOT NULL,
  PRIMARY KEY (`admID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblConservationArea`
-- -----------------------------------------------------
-- Description: Stores informtion about a ERP conservation area
-- conBorderNodeJSONObject: Stores a JSON object containing a list of the nodes
-- of the conservation area's border
-- conMiddlePointCoordinate: Stores the longitude and latitude of of the middle
-- point of the conservation area. This is also a JSON object.
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblConservationArea` (
  `conID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `conName` VARCHAR(100) NOT NULL,
  `conBorderNodeJSONObject` VARCHAR(30000) NOT NULL,
  `conMiddlePointCoordinate` VARCHAR(100) NOT NULL,
  `conCity` VARCHAR(30) NOT NULL,
  `conProvince` VARCHAR(30) NOT NULL,
  `tblAdminUser_admID` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`conID`, `tblAdminUser_admID`),
  INDEX `fk_tblConservationArea_tblAdminUser1_idx` (`tblAdminUser_admID` ASC),
  CONSTRAINT `fk_tblConservationArea_tblAdminUser1`
    FOREIGN KEY (`tblAdminUser_admID`)
    REFERENCES `dbERPCOIN`.`tblAdminUser` (`admID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;

-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblHotspotNodeCoordinate`
-- -----------------------------------------------------
-- Description: Stores informtion about a ERP conservation area's hotspots
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblHotspotNodeCoordinate` (
  `hncID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `hncCoordinateLongitude` VARCHAR(50) NOT NULL,
  `hncCoordinateLatitude` VARCHAR(50) NOT NULL,
  `hncHotLevel` INT(10) UNSIGNED NOT NULL,
  `hncFrequency` INT(10) UNSIGNED NOT NULL,
  `tblConservationArea_conID` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`hncID`, `tblConservationArea_conID`),
  INDEX `fk_tblHotspotNodeCoordinate_tblConservationArea1_idx` (`tblConservationArea_conID` ASC),
  CONSTRAINT `fk_tblHotspotNodeCoordinate_tblConservationArea1`
    FOREIGN KEY (`tblConservationArea_conID`)
    REFERENCES `dbERPCOIN`.`tblConservationArea` (`conID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblUser`
-- -----------------------------------------------------
-- Description: Stores basic informtion about an user.
-- usrWalletAddress: The address of the user's blockchain wallet.
-- usrLastPointTime: The time when the user previously sent his coordinate
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblUser` (
  `usrID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `usrUsername` VARCHAR(50) NOT NULL,
  `usrEmailAddress` VARCHAR(100) NOT NULL,
  `usrPassword` VARCHAR(60) NOT NULL,
  `usrName` VARCHAR(40) NOT NULL,
  `usrSurname` VARCHAR(40) NOT NULL,
  `usrWalletAddress` varchar(50) NOT NULL,
  `usrLastPointTime` BIGINT NOT NULL,
  PRIMARY KEY (`usrID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblAlert`
-- -----------------------------------------------------
-- Description: Stores informtion about an alert that is sent by an user.
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblAlert` (
	`aleID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`aleHeader` VARCHAR(30) NOT NULL,
  `aleDescription` VARCHAR(100) NOT NULL,
  `aleSeverity` INT(10) UNSIGNED NOT NULL,
  `aleImage` BLOB ,
  `aleBroadcast` BIT(1) NOT NULL,
  `aleLocation` VARCHAR(50) NOT NULL,
  `tblConservationArea_conID` INT(10) UNSIGNED NOT NULL,
  `tblUser_usrID` INT(10) UNSIGNED,
  PRIMARY KEY (`aleID`, `tblUser_usrID`),
  INDEX `fk_tblAlert_tblConservationArea1_idx` (`tblConservationArea_conID` ASC),
  CONSTRAINT `fk_tblAlert_tblConservationArea1`
    FOREIGN KEY (`tblConservationArea_conID`)
    REFERENCES `dbERPCOIN`.`tblConservationArea` (`conID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  INDEX `fk_tblAlert_tblUser1_idx` (`tblUser_usrID` ASC),
  CONSTRAINT `fk_tblAlert_tblUser1`
    FOREIGN KEY (`tblUser_usrID`)
    REFERENCES `dbERPCOIN`.`tblUser` (`usrID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;

-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblVehicle`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblVehicle` (
  `vehID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehRegistrationNumber` VARCHAR(50) NOT NULL,
  `vehModel` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`vehID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;

-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblConservationAreaUserPoints`
-- -----------------------------------------------------
-- Description: Stores informtion about locations users have visited at a
-- conservation area.
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblConservationAreaUserPoints` (
	`cupID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`cupDateTime` BIGINT NOT NULL,
  `cupLocationLatitude` VARCHAR(50) NOT NULL,
  `cupLocationLongitude` VARCHAR(50) NOT NULL,
  `tblConservationArea_conID` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`cupID`, `tblConservationArea_conID`),
  INDEX `fk_tblConservationAreaUserPoints_tblConservationArea1_idx` (`tblConservationArea_conID` ASC),
  CONSTRAINT `fk_tblConservationAreaUserPoints_tblConservationArea1`
    FOREIGN KEY (`tblConservationArea_conID`)
    REFERENCES `dbERPCOIN`.`tblConservationArea` (`conID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;

-- -----------------------------------------------------
-- Table `dbERPCOIN`.`tblConservationAdminStock`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbERPCOIN`.`tblConservationAdminStock` (
	`casID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `casName` VARCHAR(50) NOT NULL,
    `casRandValue` INT(10) UNSIGNED NOT NULL,
    `casCoinValue` INT(10) UNSIGNED NOT NULL,
    `casDescription` VARCHAR(255) NOT NULL,
    `casImage` BLOB,
    `casVerified` BIT(1) NOT NULL,
    `casStockAmount` INT(10) NOT NULL,    
    `tblAdminUser_admID` INT(10) UNSIGNED NOT NULL,
	PRIMARY KEY (`casID`, `tblAdminUser_admID`),
	INDEX `fk_tblConservationAdminStock_tblAdminUser1_idx` (`tblAdminUser_admID` ASC),
	CONSTRAINT `fk_tblConservationAdminStock_tblAdminUser1`
	FOREIGN KEY (`tblAdminUser_admID`)
	REFERENCES `dbERPCOIN`.`tblAdminUser` (`admID`)
	ON DELETE NO ACTION
	ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
