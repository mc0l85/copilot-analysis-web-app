
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Building, Users, MapPin, User } from 'lucide-react'

interface FilterPanelProps {
  filterOptions: {
    companies: string[]
    departments: string[]
    locations: string[]
    managers: string[]
  }
  filters: {
    companies: string[]
    departments: string[]
    locations: string[]
    managers: string[]
  }
  onFilterChange: (filterType: string, values: string[]) => void
}

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  options: string[]
  selected: string[]
  onSelectionChange: (values: string[]) => void
}

function FilterSection({ title, icon, options, selected, onSelectionChange }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (options.length === 0) {
    return null
  }

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value]
    onSelectionChange(newSelected)
  }

  const selectAll = () => {
    onSelectionChange(options)
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-3 h-auto">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selected.length}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2">
        <div className="px-3 pb-2">
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={selected.length === options.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={selected.length === 0}
            >
              Clear
            </Button>
          </div>
          
          <ScrollArea className="h-32 border rounded-md p-2">
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${title}-${option}`}
                    checked={selected.includes(option)}
                    onCheckedChange={() => handleToggle(option)}
                  />
                  <label
                    htmlFor={`${title}-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FilterPanel({ filterOptions, filters, onFilterChange }: FilterPanelProps) {
  const hasAnyFilters = Object.values(filterOptions).some(options => options.length > 0)

  if (!hasAnyFilters) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">
              Upload target users file to enable filtering options
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const clearAllFilters = () => {
    onFilterChange('companies', [])
    onFilterChange('departments', [])
    onFilterChange('locations', [])
    onFilterChange('managers', [])
  }

  const totalSelected = Object.values(filters).reduce((sum, filter) => sum + filter.length, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Filter Options</span>
        {totalSelected > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-7"
          >
            Clear All ({totalSelected})
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            <FilterSection
              title="Companies"
              icon={<Building className="h-4 w-4" />}
              options={filterOptions.companies}
              selected={filters.companies}
              onSelectionChange={(values) => onFilterChange('companies', values)}
            />
            
            <FilterSection
              title="Departments"
              icon={<Users className="h-4 w-4" />}
              options={filterOptions.departments}
              selected={filters.departments}
              onSelectionChange={(values) => onFilterChange('departments', values)}
            />
            
            <FilterSection
              title="Locations"
              icon={<MapPin className="h-4 w-4" />}
              options={filterOptions.locations}
              selected={filters.locations}
              onSelectionChange={(values) => onFilterChange('locations', values)}
            />
            
            <FilterSection
              title="Managers"
              icon={<User className="h-4 w-4" />}
              options={filterOptions.managers}
              selected={filters.managers}
              onSelectionChange={(values) => onFilterChange('managers', values)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
