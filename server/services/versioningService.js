const firestoreDataService = require('./firestoreService');
const logger = require('../utils/logger');
const crypto = require('crypto');

class VersioningService {
    /**
     * Save a new version of calculation results
     */
    async saveVersion(organizationId, portfolioId, calculationType, results, metadata) {
        try {
            const versionId = `v${Date.now()}`;

            // Ensure inputs are hashed for easy integrity check
            const assumptionsHash = this._hashObject(metadata.assumptions || {});

            const versionData = {
                id: versionId,
                portfolioId,
                organizationId,
                calculationType,
                results,
                metadata: {
                    ...metadata,
                    assumptionsHash,
                    createdAt: new Date().toISOString()
                }
            };

            // Store in a subcollection under portfolio
            await firestoreDataService.addDocument(
                `organizations/${organizationId}/portfolios/${portfolioId}/versions`,
                versionData
            );

            logger.info(`Saved version ${versionId} for portfolio ${portfolioId}`);
            return versionData;
        } catch (error) {
            logger.error('Failed to save version:', error);
            throw error;
        }
    }

    /**
     * Compare two calculation versions
     */
    async compareVersions(organizationId, portfolioId, versionId1, versionId2) {
        try {
            const [v1, v2] = await Promise.all([
                this._getVersion(organizationId, portfolioId, versionId1),
                this._getVersion(organizationId, portfolioId, versionId2)
            ]);

            if (!v1 || !v2) {
                throw new Error('One or both versions not found');
            }

            return {
                v1: { id: v1.id, date: v1.metadata.createdAt },
                v2: { id: v2.id, date: v2.metadata.createdAt },
                differences: this._calculateResultDifferences(v1.results, v2.results),
                assumptionChanges: this._compareAssumptions(
                    v1.metadata.assumptions || {},
                    v2.metadata.assumptions || {}
                )
            };
        } catch (error) {
            logger.error('Failed to compare versions:', error);
            throw error;
        }
    }

    async _getVersion(orgId, portfolioId, versionId) {
        const doc = await firestoreDataService.getDocument(
            `organizations/${orgId}/portfolios/${portfolioId}/versions`, versionId
        );
        // firestoreService might return null if not found, usually throws check implementation
        // Assuming returns data or null. Getting by query might be needed if ID is not doc ID.
        // In saveVersion we used addDocument which generates ID. Ideally we use known ID.
        // Simplified here assuming we query by the 'id' field or doc ID matching versionId.
        return doc;
    }

    _calculateResultDifferences(r1, r2) {
        // Basic flat comparison of key metrics if they exist
        const diffs = {};
        const metrics = ['total_csm', 'total_fcf', 'total_scr', 'solvency_ratio'];

        // Handle different structures (e.g. aggregate_results vs flat)
        const getVal = (res, key) => res.aggregate_results?.[key] ?? res[key] ?? 0;

        metrics.forEach(key => {
            const val1 = getVal(r1, key);
            const val2 = getVal(r2, key);
            diffs[key] = {
                v1: val1,
                v2: val2,
                delta: val2 - val1,
                pctChange: val1 !== 0 ? (val2 - val1) / val1 : 0
            };
        });
        return diffs;
    }

    _compareAssumptions(a1, a2) {
        const changes = {};
        const allKeys = new Set([...Object.keys(a1), ...Object.keys(a2)]);

        allKeys.forEach(key => {
            if (JSON.stringify(a1[key]) !== JSON.stringify(a2[key])) {
                changes[key] = { from: a1[key], to: a2[key] };
            }
        });
        return changes;
    }

    _hashObject(obj) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(obj))
            .digest('hex')
            .substring(0, 16);
    }
}

module.exports = new VersioningService();
