import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: '50 60',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    // Upper Header
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: '1pt solid #F1F5F9',
        paddingBottom: 20,
        marginBottom: 30,
    },
    projectTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    packageName: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 4,
    },
    reportTag: {
        fontSize: 9,
        fontWeight: 'extrabold',
        color: '#4F46E5',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    // Summary Grid
    summaryGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    summaryCard: {
        flex: 1,
        padding: 15,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    summaryLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    scoreGrade: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4F46E5',
        marginTop: 2,
    },
    // Sections
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
        borderLeft: '3pt solid #4F46E5',
        paddingLeft: 10,
    },
    // Vulnerability List
    vulnItem: {
        marginBottom: 15,
        paddingBottom: 15,
        borderBottom: '0.5pt solid #F1F5F9',
    },
    vulnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    vulnRuleId: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0F172A',
        fontFamily: 'Helvetica-Bold',
    },
    severity: {
        fontSize: 8,
        fontWeight: 'bold',
        padding: '2 6',
        borderRadius: 4,
    },
    severityCritical: { color: '#B91C1C', backgroundColor: '#FEF2F2' },
    severityWarning: { color: '#B45309', backgroundColor: '#FFFBEB' },
    vulnMessage: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.4,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 60,
        right: 60,
        borderTop: '0.5pt solid #F1F5F9',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 8,
        color: '#94A3B8',
    },
});

export const SecurityReportPDF = ({ data }: { data: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Minimal Header */}
            <View style={styles.headerSection}>
                <View>
                    <Text style={styles.projectTitle}>{data.project.name}</Text>
                    <Text style={styles.packageName}>
                        {data.apk.packageName} • v{data.apk.versionName}
                    </Text>
                </View>
                <Text style={styles.reportTag}>Security Audit</Text>
            </View>

            {/* Professional Summary Grid */}
            <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Trust Score</Text>
                    <Text style={styles.summaryValue}>{data.score.value}</Text>
                    <Text style={styles.scoreGrade}>Grade: {data.score.grade}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Critical</Text>
                    <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{data.severitySummary.critical}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Warnings</Text>
                    <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{data.severitySummary.warning}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Permissions</Text>
                    <Text style={styles.summaryValue}>{data.permissions.length}</Text>
                </View>
            </View>

            {/* Key Findings Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Key Findings</Text>
            </View>

            {data.vulnerabilities.length === 0 ? (
                <Text style={{ fontSize: 10, color: '#64748B', fontStyle: 'italic' }}>No vulnerabilities detected.</Text>
            ) : (
                data.vulnerabilities.slice(0, 15).map((v: any, i: number) => (
                    <View key={i} style={styles.vulnItem}>
                        <View style={styles.vulnHeader}>
                            <Text style={styles.vulnRuleId}>{v.ruleId}</Text>
                            <View style={[styles.severity, v.severity === 'ERROR' ? styles.severityCritical : styles.severityWarning]}>
                                <Text>{v.severity}</Text>
                            </View>
                        </View>
                        <Text style={styles.vulnMessage}>{v.message}</Text>
                    </View>
                ))
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Automated Scan Result</Text>
                <Text style={styles.footerText}>
                    Date: {new Date(data.completedAt).toLocaleDateString()}
                </Text>
            </View>
        </Page>
    </Document>
);
