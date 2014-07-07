<?php

namespace Geonef\PgLinkBundle\Document\Type;

/**
 * Base class for PgLink Table types
 *
 * @package PgLink
 * @todo filterWidgetClass
 * @todo editionWidgetClass
 */
abstract class AbstractType
{

  /**
   * Return the human name for the type
   *
   * @return string
   */
  abstract public function getTitle();

  /**
   * Get type options
   *
   * @return array associative array - follows the jig.input value logic
   */
  abstract public function getOptions();

  /**
   * Set type options
   *
   * @param $options array associative array - follows the jig.input value logic
   */
  abstract public function setOptions($options);

  /**
   * Return the SQL type to use in an CREATE TABLE or ADD COLUMN
   *
   * Example: "varchar(255) NOT NULL"
   *
   * @return string
   */
  abstract public function getTypeSql();

  /**
   * Return the SQL to use for selecting the column
   *
   * It defines the view.
   *
   * If needed, it must include an alias (... AS alias).
   * The logic of this method is tied to that of method "getPhpValue":
   * getSelectSql() can return whatever valid SQL it wants, as long
   * as getPhpValue() knows how to interpret it righteously.
   *
   * @return string
   */
  abstract public function getSelectSql();

  /**
   * Return SQL expr for the value, suitable for INSERT or UPDATE
   *
   * @param $phpValue mixed
   * @return string
   */
  abstract public function getDbValue($phpValue);

  /**
   * Return PHP value given the result from an SQL SELECT query
   *
   * The kind of value passed as $dbValue depends on
   * what getSelectSql() returns.
   *
   * @param $dbValue
   * @return string
   */
  public function getPhpValue($dbValue)
  {
    return $dbValue;
  }

  /**
   * Hook, called after the column has been created
   *
   * To be used for types requiring an extra op like GEOMETRY
   * for updating the "geometry_columns" table.
   */
  protected function postCreateTableColumn()
  {
    // nothing by default
  }

}
