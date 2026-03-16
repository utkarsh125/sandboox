import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registering standard fonts for a clean look
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 700 },
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: '60 60',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    // Upper Header
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2pt solid #BDF34E',
        paddingBottom: 25,
        marginBottom: 35,
    },
    projectTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0D0D0D',
        letterSpacing: -0.8,
    },
    packageName: {
        fontSize: 10,
        color: '#A1A1A1',
        marginTop: 6,
        fontFamily: 'Helvetica-Bold',
    },
    reportTag: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: '#BDF34E',
        padding: '6 12',
        borderRadius: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    // Summary Grid
    summaryGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 45,
    },
    summaryCard: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        border: '0.5pt solid #E5E7EB',
    },
    summaryLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#A1A1A1',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0D0D0D',
    },
    scoreGrade: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#BDF34E',
        backgroundColor: '#0D0D0D',
        padding: '2 8',
        borderRadius: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    // Sections
    sectionHeader: {
        marginBottom: 25,
        backgroundColor: '#F3F4F6',
        padding: '10 15',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0D0D0D',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Vulnerability List
    vulnItem: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#FFFFFF',
        border: '0.5pt solid #F3F4F6',
        borderRadius: 10,
    },
    vulnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    vulnRuleId: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0D0D0D',
        fontFamily: 'Helvetica-Bold',
    },
    severity: {
        fontSize: 9,
        fontWeight: 'bold',
        padding: '3 8',
        borderRadius: 6,
        textTransform: 'uppercase',
    },
    severityCritical: { color: '#FFFFFF', backgroundColor: '#EF4444' },
    severityWarning: { color: '#0D0D0D', backgroundColor: '#F59E0B' },
    vulnMessage: {
        fontSize: 10,
        color: '#4B5563',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 60,
        right: 60,
        borderTop: '1pt solid #F3F4F6',
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 9,
        color: '#A1A1A1',
        fontStyle: 'italic',
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
                <Text style={styles.reportTag}>Audit Summary</Text>
            </View>

            {/* Professional Summary Grid */}
            <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Trust Index</Text>
                    <Text style={styles.summaryValue}>{data.score.value}</Text>
                    <Text style={styles.scoreGrade}>GRADE {data.score.grade}</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeft: '4pt solid #EF4444' }]}>
                    <Text style={styles.summaryLabel}>Critical</Text>
                    <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{data.severitySummary.critical}</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeft: '4pt solid #F59E0B' }]}>
                    <Text style={styles.summaryLabel}>Warnings</Text>
                    <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{data.severitySummary.warning}</Text>
                </View>
            </View>

            {/* Key Findings Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vulnerability Log</Text>
            </View>

            {data.vulnerabilities.length === 0 ? (
                <Text style={{ fontSize: 11, color: '#A1A1A1', fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>
                    No critical vulnerabilities were detected during this audit cycle.
                </Text>
            ) : (
                data.vulnerabilities.slice(0, 10).map((v: any, i: number) => (
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
                <Text style={styles.footerText}>Certified Automated Security Assessment</Text>
                <Text style={styles.footerText}>
                    Generated: {new Date(data.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
            </View>
        </Page>
    </Document>
);
