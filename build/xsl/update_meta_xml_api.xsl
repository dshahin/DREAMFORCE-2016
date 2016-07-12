<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sf="http://soap.sforce.com/2006/04/metadata" xmlns="http://soap.sforce.com/2006/04/metadata"  exclude-result-prefixes="sf">

<xsl:output indent="yes"/>

<xsl:param name="apiVersion" />

<xsl:template match="node()|@*">
  <xsl:copy>
    <xsl:apply-templates select="node()|@*"/>
  </xsl:copy>
</xsl:template>

<xsl:template match="sf:apiVersion/text()">
  <xsl:value-of select="$apiVersion" /> 
</xsl:template>

</xsl:stylesheet>
