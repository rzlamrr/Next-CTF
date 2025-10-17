/**
 * Users API
 *
 * GET /api/users
 *   - Visibility controlled by accounts_visibility setting
 *   - Returns a paginated list of users
 *   - Query params: take (default: 50), skip (default: 0), q (search query), filter (username|country|affiliation)
 *   Response: { "success": true, "data": [{ id, name, website, affiliation, country }] }
 */

import { listUsers } from '@/lib/db/queries'
import { ok, err, toErrorResponse } from '@/lib/utils/http'
import { canAccessAccounts } from '@/lib/auth/visibility'

export async function GET(request: Request): Promise<Response> {
  try {
    // Check if user has access to accounts
    const hasAccess = await canAccessAccounts()
    if (!hasAccess) {
      return err('UNAUTHORIZED', 'Access to user accounts requires authentication', 401)
    }

    const { searchParams } = new URL(request.url)
    console.log('Users API called with params:', Object.fromEntries(searchParams.entries()))
    
    // Parse pagination parameters
    const rawTake = searchParams.get('take')
    const rawSkip = searchParams.get('skip')
    
    const take = rawTake ? parseInt(rawTake, 10) : 50
    const skip = rawSkip ? parseInt(rawSkip, 10) : 0
    
    console.log('Parsed pagination - take:', take, 'skip:', skip)
    
    // Parse search parameters
    const q = searchParams.get('q') || undefined
    const filter = searchParams.get('filter') || undefined
    
    console.log('Search params - q:', q, 'filter:', filter)
    
    // Validate pagination parameters
    if (isNaN(take) || take < 1 || take > 100) {
      console.log('Validation error for take:', take)
      return err('VALIDATION_ERROR', 'take must be between 1 and 100', 400)
    }
    
    if (isNaN(skip) || skip < 0) {
      console.log('Validation error for skip:', skip)
      return err('VALIDATION_ERROR', 'skip must be a positive number', 400)
    }
    
    // Build search query based on filter type
    let searchQuery = q
    if (q && filter) {
      switch (filter) {
        case 'username':
          // Default search already includes username
          break
        case 'country':
          // We need to extend the listUsers function to support country search
          // For now, we'll use the general search
          break
        case 'affiliation':
          // We need to extend the listUsers function to support affiliation search
          // For now, we'll use the general search
          break
      }
    }
    
    console.log('About to call listUsers with params:', { take, skip, q: searchQuery })
    
    // Fetch users with pagination and search
    const users = await listUsers({ take, skip, q: searchQuery })
    
    console.log('listUsers returned', users.length, 'users')
    
    // Transform the data for public consumption
    const publicUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      website: (user as any).website || null,
      affiliation: (user as any).affiliation || null,
      country: (user as any).country || null,
    }))
    
    console.log('Returning public users:', publicUsers.length)
    
    return ok(publicUsers, 200)
  } catch (e) {
    console.error('Error in users API:', e)
    return toErrorResponse(e, 'Failed to fetch users')
  }
}